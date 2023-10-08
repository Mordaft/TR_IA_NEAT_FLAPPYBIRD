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
                        perPage: 10,
                        perPageSelect: false,
                        scrollY: 'true',
                        data: {
                            // headings: Object.keys(data[0]),
                            headings: ['Generation ID', 'Genome Count', 'Score Sum', 'Score Avg'],
                            data: data.map(item => Object.values(item))
                        }
                    });

        });
    }

    listPopulationTable(generationId: string) {
        this.database.getNeatNetworksByGenerationId(generationId).toArray().then((data: any[]) => {
            this.populationTable.insert(data);
            this.populationTable.update();
            this.populationTable.refresh();
        });
    }
    
    initStatsPage() {
        this.listGenerationsTable();
        this.populationTable.data.data = [];
    }

}