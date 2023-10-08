
import * as vis from 'vis-network';
/**
 * A class representing a graph using the vis.js library.
 */
export class Graph { 

    /**
     * An array of nodes with their respective id and label.
     */
    private nodesarr: { id: any; label: any; }[];

    /**
     * An array of edges with their respective source and target.
     */
    private edgessarr: { from: any; to: any; }[];

    /**
     * The data object containing the nodes and edges arrays.
     */
    private data: vis.Data;

    /**
     * The vis.js Network object.
     */
    private network: vis.Network;

    /**
     * The HTML element that will contain the graph.
     */
    private container:HTMLElement;

    /**
     * Creates a new Graph instance.
     * @param divId The id of the HTML element that will contain the graph.
     */
    constructor(divId :string){

        this.nodesarr = [];
        this.edgessarr = [];    
        this.data = {
            nodes: [],
            edges: []
        }
        this.container = document.getElementById(divId) as HTMLElement;
        var options = 
        {
          layout: {
            improvedLayout:true,
            hierarchical: {
              sortMethod: 'directed',
              shakeTowards: 'roots',
              direction: 'LR',        // UD, DU, LR, RL
//              blockShifting: true,
//              edgeMinimization: true,
              parentCentralization: true,
//              levelSeparation: 60,
//              nodeSpacing: 60

            },

          },
          physics: {
            enabled: false,
            hierarchicalRepulsion: {
              "centralGravity": 0
            },
            "minVelocity": 0.75,
            "solver": "hierarchicalRepulsion"
          },
          edges: {
            arrows: { to: true },
            scaling: {
              max: 6
            },
            selfReference: {
              angle: 0.7853981633974483
            },
            smooth: false
          },
          // nodes: {
          //   shape: "dot"
          // },
          width: "600px",
          height: "600px"
        };
        
        this.network = new vis.Network(this.container, this.data , options);
      
    }

    /**
     * Updates the graph with new data.
     * @param mygraph An object containing the nodes and edges arrays.
     */
    public graphIt(mygraph: any){
        let _this = this;
        this.nodesarr = []    
        let mynodes = mygraph.nodes;
        // console.info('Graph nodes', mynodes);
        mynodes.forEach(function(mynode: { id: any; name: any; activation: any; bias: any; }){
          let nodeLevel =2;
          let nodeColor = '#4dc3ff';
          if (mynode.name == 'INPUT') {
            nodeLevel = 1;
            nodeColor = '#00cc66';
          }
          else if (mynode.name == 'OUTPUT') {
            nodeLevel = 3;
            nodeColor = '#990099';
          }

          let node = {
            shape: "dot",
            id: mynode.id,
            label:  mynode.id + ' - ' + mynode.name + (
                    (mynode.activation!= undefined ? ('\n activation:' + (Math.round(mynode.activation * 100) / 100).toFixed(2)) : ('\n activation: undefined')) +
                    (mynode.bias != undefined ? ('\n bias:' + (Math.round(mynode.bias * 100) / 100).toFixed(2)) : ('\n bias: undefined'))
                    ),
            fontFace: 'sans-serif',
            fontSize: '8px',
            fontColor: '#006442',
            level: nodeLevel,
            color: {
              background: nodeColor
            }
          }
          _this.nodesarr.push(node);
        })
    
        this.edgessarr = [];   
        let mylinks = mygraph.links;
        mylinks.forEach(function(mylink: { source: any; target: any; }){
          let edge = {
            from: mylink.source,
            to: mylink.target
          }
          _this.edgessarr.push(edge);
        })
        
        this.data = {
          nodes: this.nodesarr,
          edges: this.edgessarr
        }
        this.network.setData(this.data);
        this.network.fit();
        this.network.redraw();
        // console.info('Graph data', this.data);
      }

}