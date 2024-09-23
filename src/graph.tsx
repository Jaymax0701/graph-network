import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Define the Node interface
interface Node extends d3.SimulationNodeDatum {
    id: number;
    label: string;
    fx?: number | null;
    fy?: number | null;
    color?: string; // Custom color for each node
}

// Define the Edge interface with source and target as number or Node
interface Edge extends d3.SimulationLinkDatum<Node> {
    id: number; // Unique identifier for each edge
    source: number | Node;
    target: number | Node;
}

const GraphView: React.FC = () => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    const [graphData, setGraphData] = useState<{ nodes: Node[]; edges: Edge[] }>({
        nodes: [
            { id: 1, label: "Node 1", color: "#ff0000" },
            { id: 2, label: "Node 2", color: "#00ff00" },
            { id: 3, label: "Node 3", color: "#0000ff" }
        ],
        edges: [
            { id: 1, source: 1, target: 2 },
            { id: 2, source: 2, target: 3 }
        ]
    });

    const [nextNodeId, setNextNodeId] = useState(4);
    const [nextEdgeId, setNextEdgeId] = useState(3); // Initialize nextEdgeId
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const [edgeToDeleteId, setEdgeToDeleteId] = useState<number | null>(null);
    const [newEdgeSource, setNewEdgeSource] = useState<number | null>(null);
    const [newEdgeTarget, setNewEdgeTarget] = useState<number | null>(null);
    const [newLabel, setNewLabel] = useState<string>("");
    const [newColor, setNewColor] = useState<string>("#ffffff");

    // Define colors
    const edgeColor = "#61dafb";
    const selectedEdgeColor = "#ff69b4"; // Hot Pink for selected edge

    useEffect(() => {
        if (!svgRef.current) return;

        // Clear previous SVG content before rendering new elements
        const svgElement = d3.select(svgRef.current);
        svgElement.selectAll("*").remove();

        const svgWidth = 900;
        const svgHeight = 600;

        const svg = svgElement
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .style('background-color', '#2c2f33');

        const svgGroup = svg.append('g');

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                svgGroup.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Initialize simulation
        const simulation = d3.forceSimulation<Node>(graphData.nodes)
            .force('link', d3.forceLink<Node, Edge>(graphData.edges)
                .id((d: Node) => d.id)
                .distance(150)
            )
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
            .force('collision', d3.forceCollide().radius(50));

        // Draw edges with visual confirmation for selected edge
        const link = svgGroup.selectAll<SVGLineElement, Edge>('line')
            .data(graphData.edges, (d: Edge) => d.id)
            .join('line')
            .attr('stroke', (d) => d.id === edgeToDeleteId ? selectedEdgeColor : edgeColor) // Highlight selected edge
            .attr('stroke-width', (d) => d.id === edgeToDeleteId ? 4 : 2) // Thicker stroke for selected edge
            .attr('opacity', 0.6)
            .on('contextmenu', (event, d) => {
                event.preventDefault();
                setEdgeToDeleteId(d.id);
            });

        // Draw nodes
        const node = svgGroup.selectAll<SVGCircleElement, Node>('circle')
            .data(graphData.nodes, (d: Node) => d.id)
            .join('circle')
            .attr('r', 20)
            .attr('fill', d => d.color || '#666')
            .attr('stroke', d => d.id === selectedNodeId ? '#ffffff' : '#000000')
            .attr('stroke-width', d => d.id === selectedNodeId ? 3 : 1.5)
            .call(
                d3.drag<SVGCircleElement, Node>()
                    .on('start', (event, d) => {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on('drag', (event, d) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on('end', (event, d) => {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = d.x;
                        d.fy = d.y; // Fix node in position
                    })
            )
            .on('click', (event, d) => {
                // Prevent event from bubbling up to SVG (which might have zoom/pan handlers)
                event.stopPropagation();
                setSelectedNodeId(d.id);
                setNewLabel(d.label);
                setNewColor(d.color || "#ffffff");
            });

        // Draw labels
        const label = svgGroup.selectAll<SVGTextElement, Node>('text')
            .data(graphData.nodes, (d: Node) => d.id)
            .join('text')
            .text(d => d.label)
            .attr('font-size', '14px')
            .attr('fill', '#fff')
            .attr('font-family', 'Arial, sans-serif')
            .attr('pointer-events', 'none') // Allow clicks to pass through to nodes
            .attr('text-anchor', 'middle');

        // Simulation tick
        simulation.on('tick', () => {
            link
                .attr('x1', (d: any) => (typeof d.source === 'number' ? d.source : d.source.x))
                .attr('y1', (d: any) => (typeof d.source === 'number' ? d.source : d.source.y))
                .attr('x2', (d: any) => (typeof d.target === 'number' ? d.target : d.target.x))
                .attr('y2', (d: any) => (typeof d.target === 'number' ? d.target : d.target.y));

            node
                .attr('cx', (d: any) => d.x)
                .attr('cy', (d: any) => d.y);

            label
                .attr('x', (d: any) => d.x)
                .attr('y', (d: any) => d.y + 5);
        });

        // Handle click outside nodes to deselect
        svg.on('click', () => {
            setSelectedNodeId(null);
            setEdgeToDeleteId(null);
        });

        return () => {
            simulation.stop();
        };
    }, [graphData, edgeToDeleteId, selectedNodeId]);

    // Add new node
    const addNode = () => {
        const newNode: Node = { id: nextNodeId, label: `Node ${nextNodeId}`, color: "#666" };
        setGraphData(prev => ({
            nodes: [...prev.nodes, newNode],
            edges: [...prev.edges]
        }));
        setNextNodeId(prev => prev + 1);
    };

    // Add new edge
    const addEdge = () => {
        if (newEdgeSource === null || newEdgeTarget === null) {
            alert("Please select both source and target nodes.");
            return;
        }
        if (newEdgeSource === newEdgeTarget) {
            alert("Cannot connect a node to itself.");
            return;
        }

        // Check if the edge already exists
        const edgeExists = graphData.edges.some(edge =>
            (edge.source === newEdgeSource && edge.target === newEdgeTarget) ||
            (edge.source === newEdgeTarget && edge.target === newEdgeSource)
        );

        if (edgeExists) {
            alert("Edge already exists.");
            return;
        }

        const newEdge: Edge = { id: nextEdgeId, source: newEdgeSource, target: newEdgeTarget };
        setGraphData(prev => ({
            nodes: [...prev.nodes],
            edges: [...prev.edges, newEdge]
        }));
        setNextEdgeId(prev => prev + 1);
        setNewEdgeSource(null);
        setNewEdgeTarget(null);
    };

    // Delete selected node and associated edges
    const deleteNode = () => {
        if (selectedNodeId === null) {
            alert("Please select a node to delete.");
            return;
        }

        setGraphData(prev => ({
            nodes: prev.nodes.filter(node => node.id !== selectedNodeId),
            edges: prev.edges.filter(edge => {
                const sourceId = typeof edge.source === 'number' ? edge.source : edge.source.id;
                const targetId = typeof edge.target === 'number' ? edge.target : edge.target.id;
                return sourceId !== selectedNodeId && targetId !== selectedNodeId;
            })
        }));
        setSelectedNodeId(null);
    };

    // Delete selected edge
    const deleteEdge = () => {
        if (edgeToDeleteId === null) {
            alert("Please select an edge to delete.");
            return;
        }
        setGraphData(prev => ({
            nodes: [...prev.nodes],
            edges: prev.edges.filter(edge => edge.id !== edgeToDeleteId)
        }));
        setEdgeToDeleteId(null);
    };

    // Update node label and color
    const updateNode = () => {
        if (selectedNodeId === null) {
            alert("Please select a node to update.");
            return;
        }

        if (newLabel.trim() === "") {
            alert("Label cannot be empty.");
            return;
        }

        setGraphData(prev => ({
            nodes: prev.nodes.map(node =>
                node.id === selectedNodeId
                    ? { ...node, label: newLabel, color: newColor }
                    : node
            ),
            edges: [...prev.edges]
        }));
    };

    return (
        <div style={{ backgroundColor: '#2c2f33', padding: '20px', minHeight: '100vh', color: 'white' }}>
            <h2>Graph View</h2>
            <svg ref={svgRef} style={{ border: '1px solid #ccc', borderRadius: '4px' }}></svg>
            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {/* Add Node */}
                <div>
                    <button onClick={addNode} style={buttonStyle}>Add Node</button>
                </div>

                {/* Delete Node */}
                <div>
                    <label htmlFor="delete-node-select">Select Node to Delete: </label>
                    <select
                        id="delete-node-select"
                        value={selectedNodeId ?? ""}
                        onChange={(e) => setSelectedNodeId(e.target.value ? Number(e.target.value) : null)}
                        style={selectStyle}
                    >
                        <option value="">Select Node</option>
                        {graphData.nodes.map((node) => (
                            <option key={node.id} value={node.id}>
                                {node.label}
                            </option>
                        ))}
                    </select>
                    <button onClick={deleteNode} style={buttonStyle}>Delete Selected Node</button>
                </div>

                {/* Rename and Recolor Node */}
                <div>
                    <label htmlFor="rename-node-input">Rename Node: </label>
                    <input
                        id="rename-node-input"
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="New label"
                        style={inputStyle}
                    />
                    <br />
                    <label htmlFor="recolor-node-input">Assign Color: </label>
                    <input
                        id="recolor-node-input"
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        style={{ ...inputStyle, padding: '0', width: '50px', height: '30px' }}
                    />
                    <br />
                    <button onClick={updateNode} style={buttonStyle}>Update Node</button>
                </div>

                {/* Add Edge */}
                <div>
                    <label htmlFor="source-node-select">Add Edge: </label>
                    <br />
                    <label htmlFor="source-node-select">Source: </label>
                    <select
                        id="source-node-select"
                        value={newEdgeSource ?? ""}
                        onChange={(e) => setNewEdgeSource(e.target.value ? Number(e.target.value) : null)}
                        style={selectStyle}
                    >
                        <option value="">Select Source Node</option>
                        {graphData.nodes.map((node) => (
                            <option key={node.id} value={node.id}>
                                {node.label}
                            </option>
                        ))}
                    </select>
                    <br />
                    <label htmlFor="target-node-select">Target: </label>
                    <select
                        id="target-node-select"
                        value={newEdgeTarget ?? ""}
                        onChange={(e) => setNewEdgeTarget(e.target.value ? Number(e.target.value) : null)}
                        style={selectStyle}
                    >
                        <option value="">Select Target Node</option>
                        {graphData.nodes.map((node) => (
                            <option key={node.id} value={node.id}>
                                {node.label}
                            </option>
                        ))}
                    </select>
                    <br />
                    <button onClick={addEdge} style={buttonStyle}>Add Edge</button>
                </div>

                {/* Delete Edge */}
                <div>
                    <label htmlFor="delete-edge-select">Delete Edge: </label>
                    <select
                        id="delete-edge-select"
                        value={edgeToDeleteId ?? ""}
                        onChange={(e) => setEdgeToDeleteId(e.target.value ? Number(e.target.value) : null)}
                        style={selectStyle}
                    >
                        <option value="">Select Edge</option>
                        {graphData.edges.map((edge) => {
                            const sourceId = typeof edge.source === 'number' ? edge.source : edge.source.id;
                            const targetId = typeof edge.target === 'number' ? edge.target : edge.target.id;

                            const sourceLabel = graphData.nodes.find(node => node.id === sourceId)?.label || `Node ${sourceId}`;
                            const targetLabel = graphData.nodes.find(node => node.id === targetId)?.label || `Node ${targetId}`;
                            return (
                                <option key={edge.id} value={edge.id}>
                                    {sourceLabel} to {targetLabel}
                                </option>
                            );
                        })}
                    </select>
                    <button onClick={deleteEdge} style={buttonStyle}>Delete Selected Edge</button>
                </div>
            </div>
        </div>
    );
};

// Inline styles for consistency and better readability
const buttonStyle: React.CSSProperties = {
    marginTop: '10px',
    padding: '8px 12px',
    backgroundColor: '#61dafb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#2c2f33',
    fontWeight: 'bold'
};

const selectStyle: React.CSSProperties = {
    marginTop: '10px',
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '220px' // Adjusted width for better alignment
};

const inputStyle: React.CSSProperties = {
    marginTop: '10px',
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '200px'
};

export default GraphView;
