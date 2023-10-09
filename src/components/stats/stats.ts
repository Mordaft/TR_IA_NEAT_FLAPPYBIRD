import { DataTable } from "simple-datatables";
import { NeatFlappyBirdDatabase } from "../data/database";

export class Stats{

    database: NeatFlappyBirdDatabase;
    generationsTable: DataTable;
    populationTable: DataTable;

    constructor(database: NeatFlappyBirdDatabase){
        this.database = database;
        
        this.generationsTable = new DataTable("#tableGenerations", 
            {   
                data: {  
                    data: [],
                    headings: ['Generation ID', 'Genome Count', 'Score Sum', 'Score Avg']
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
        console.info("listGenerationsTable");
        this.database.getGenerations().then((data) => {
            this.generationsTable.destroy();
            this.generationsTable = new DataTable("#tableGenerations",{
                        rowNavigation: true,
                        searchable: false,
                        fixedHeight: true,
                        fixedColumns: true,
                        perPage: 10,
                        perPageSelect: undefined,
                        scrollY: 'true',
                        data: {
                            headings: ['Generation ID defined as a very long Guuid string', 'Genome Count', 'Score Sum', 'Score Avg'],
                            data: data.map(item => Object.values(item))
                        }
                    });
            this.generationsTable.on("datatable.selectrow", (rowIndex: number | void) => {
                let generationId = this.generationsTable.data.data[rowIndex as number][0].text;
                // console.info("datatable.selectrow", rowIndex, generationId);                
                this.listPopulationTable(generationId as string);
            });
        });
    }

    listPopulationTable(generationId: string) {
        this.database.getNeatNetworksByGenerationId(generationId).toArray().then((data) => {
            let lista: any[] = data.map(item => [ item.getPopulationIndex(), item.getScore(), item.getNetwork()]);
            // console.info("listPopulationTable", lista);
            this.populationTable.destroy();
            this.populationTable = new DataTable("#tablePopulation",{
                        rowNavigation: true,
                        searchable: false,
                        fixedHeight: true,
                        fixedColumns: true,
                        perPage: 10,
                        perPageSelect: undefined,
                        scrollY: 'true',
                        data: {
                            headings: ['Genome Index', 'Score', 'Action'],
                            data: lista
                        }
                    });
            });
    }
    
    initStatsPage() {
        this.listGenerationsTable();
        this.populationTable.data.data = [];
    }

}