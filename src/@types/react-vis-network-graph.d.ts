declare module 'react-vis-network-graph' {
    import { Component } from 'react';

    export interface GraphProps {
        graph: {
            nodes: Array<{ id: number; label: string }>;
            edges: Array<{ from: number; to: number }>;
        };
        options?: any; // Define more specific types if possible
    }

    export default class VisGraph extends Component<GraphProps> {}
}
