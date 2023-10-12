import { DataTable } from "simple-datatables";
import { NeatFlappyBirdDatabase } from "../data/database";
import { Graph } from "../graph/graph";

export class Stats{

    database: NeatFlappyBirdDatabase;
    generationsTable: DataTable;
    populationTable: DataTable;
    graph: Graph;
    selectedGenerationId!: string;
    lastNeatNetworksByGenerationId!: any[];

    constructor(database: NeatFlappyBirdDatabase){
        this.database = database;
        
        this.graph = new Graph("graphStats");

        this.generationsTable = new DataTable("#tableGenerations", 
            {   
                data: {  
                    data: [],
                    headings: ['Generation ID', 'Genome Count', 'Genome Score Sum', 'Genome Score Avg']
                }
            }
        );
        this.populationTable = new DataTable("#tablePopulation", 
            {   
                data: {  
                    headings: ['Genome Index', 'Score', 'Action']
                }
            }
        );
    }

    listGenerationsTable() {
        let _this = this;
        // console.info("listGenerationsTable");
        this.database.getGenerations().then((data) => {
            this.generationsTable.destroy();
            this.generationsTable = new DataTable("#tableGenerations",{
                        // rowNavigation: true,
                        searchable: false,
                        // fixedHeight: true,
                        fixedColumns: true,
                        // perPage: 10,
                        paging: false,
                        // perPageSelect: undefined,
                        scrollY: '50vh',
                        data: {
                            headings: ['Generation ID', 'Count', 'Score Sum', 'Score Avg'],
                            data: data.map(item => Object.values(item))
                        }
                    });
            this.generationsTable.on("datatable.selectrow", (rowIndex: number | void, event: Event | void) => {
                if (event != undefined){
                    let rowElement:HTMLElement = (event.target as HTMLElement)?.parentElement as HTMLElement;
                    rowElement.parentElement?.querySelectorAll("tr").forEach((element) => {
                        element.classList.remove("selected");
                    });
                    rowElement.classList.add("selected");
                    _this.selectedGenerationId = this.generationsTable.data.data[rowIndex as number][0].text as string;
                    // console.info("datatable.selectrow", rowIndex, this.selectedGenerationId);                
                    _this.listPopulationTable(this.selectedGenerationId);
                }
            });
        });
    }

    listPopulationTable(generationId: string) {
        let _this = this;
        this.database.getNeatNetworksByGenerationId(generationId).toArray().then((data) => {
            _this.lastNeatNetworksByGenerationId = data.map(item => [ item.getPopulationIndex(), item.getScore(), item.getNetwork()]);
            // console.info("listPopulationTable", lista);
            this.populationTable.destroy();
            this.populationTable = new DataTable("#tablePopulation",{
                        // rowNavigation: true,
                        searchable: false,
                        fixedHeight: false,
                        fixedColumns: true,
                        // perPage: 10,
                        paging: false,
                        // perPageSelect: undefined,
                        scrollY: '50vh',
                        columns: [
                                { select: 2, render: (_data: any, _cell: any, _row: any) => {  
                                        return `<button class="button showGraphButton">Show</button>`;
                                    } 
                                },
                            ],
                        data: {
                            headings: ['Genome Index', 'Score', 'Action'],
                            data: _this.lastNeatNetworksByGenerationId
                        }
                    });
            }).then(() => {
                document.querySelectorAll(".showGraphButton").forEach((element) => { 
                    // console.info("showGraphButton", element);
                    element.addEventListener("click", (event) => {
                        // let genomeElement = (event.target as HTMLElement);
                        console.info("showGraphButton", genomeElement.parentElement?.parentElement?.children[0].textContent);
                        //let indexSelected = parseInt(genomeElement.getAttribute("data-click") as string);
                        let indexSelected = parseInt(genomeElement.parentElement?.parentElement?.children[0]?.textContent as string);
                        let subTitleElement = document.querySelector("#graphSubTitle");
                        if (subTitleElement){
                            subTitleElement.innerHTML = "Generation ID: " + _this.selectedGenerationId + " - Genome Index: " + indexSelected;
                        }
                        _this.showNetwork(indexSelected);
                    });
                });
            });
    }
    
    initStatsPage() {
        this.listGenerationsTable();
        this.populationTable.data.data = [];
    }

    showNetwork(index: number) {
        // console.info("showNetwork", this.lastNeatNetworksByGenerationId[index][2]);
        this.graph.graphIt(this.lastNeatNetworksByGenerationId[index][2]);
    }

}