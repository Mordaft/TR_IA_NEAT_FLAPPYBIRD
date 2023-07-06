import * as vis from 'vis-network';


export class Graph { 

    private nodesarr: { id: any; label: any; }[];
    private edgessarr: { from: any; to: any; }[];
    private data: vis.Data;
    private network: vis.Network;
    private container:HTMLElement;

    constructor(divId :string){

        this.nodesarr = [];
        this.edgessarr = [];    
        this.data = {
            nodes: [],
            edges: []
        }
        this.container = document.getElementById(divId) as HTMLElement;
        var options = {
          nodes: {
            shape: "dot"
          }
        };
        this.network = new vis.Network(this.container, this.data , options);
    }



    public graphIt(mygraph: any){
        let _this = this;
        this.nodesarr = []    
        let mynodes = mygraph.nodes;
        mynodes.forEach(function(mynode: { id: any; name: any; }){
          let node = {
            id: mynode.id,
            label: mynode.name
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
    
      }


}