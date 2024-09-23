# Graph Network Project

## Overview
This project is a React application that visualizes a graph network using D3.js. Users can interact with nodes and edges, allowing for dynamic modifications of the graph, including adding or deleting nodes and edges, and updating node properties.
- The situation use for this is transportation@airport.
- This is also my first project using React and D3 in development, any faulty is deeply regret

## Design choice
The colour option is being used to fit in the modern days demand and habits of using the dark mode hence why the colour choices are based on darkmode.

## Features
- **Interactive Graph Visualization:** Nodes and edges can be dragged, clicked, and interacted with.
- **Add/Delete Nodes:** Users can easily add new nodes to the graph and delete existing ones.
- **Add/Delete Edges:** Create connections between nodes and remove them as needed.
- **Edit Node Properties:** Change node labels and colors dynamically.
- **Zoom and Pan Functionality:** Users can zoom in/out and pan around the graph for better navigation.

## Technologies Used
- **React:** For building the user interface.
- **D3.js:** For rendering the graph and handling the data visualization.
- **TypeScript:** For type safety and better development experience.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Jaymax0701/graph-network.git
   ```
2. Navigate to the project directory:
   ```bash
   cd graph-network
   ```
3. Install the dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application
To start the development server, run:
```bash
npm start
# or
yarn start
```
Open your browser and navigate to `http://localhost:3000` to see the application in action.

## Usage
- Click on a node to select it, where you can edit its label and color.
- Right-click on an edge to select it for deletion.
- Use the provided buttons to add new nodes and edges or to delete existing ones.
- You can also change the node name by selecting it and change it.

## Faulty
- After changes in name the after deleting the node, the edge attached to it in previous name wont deleted automatically 


## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgements
- [D3.js](https://d3js.org/) for the powerful data visualization library.
- [React](https://reactjs.org/) for the component-based UI framework.

```
