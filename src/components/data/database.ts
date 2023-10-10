import Dexie, { Collection, Table } from "dexie";
import { NeatNetwork } from "./neatNetwork";
import { Guid } from "guid-typescript";




export class NeatFlappyBirdDatabase extends Dexie {
    trainsets!: Table;
    neatnetworks!: Table;
    
    /**
     * Creates a new instance of the FlappyBirdIADatabase class.
     * @constructor
     */
    constructor() {  
        super("FlappyBirdIADatabase");
        
        this.version(1).stores({
            neatnetworks: '++id, [generationId+populationIndex], score, created',
        });

        this.neatnetworks = this.table("neatnetworks");
        this.neatnetworks.mapToClass(NeatNetwork);
        
        this.open();
    }


    /**
     * Returns a collection of all the NEAT networks stored in the database.
     * @returns {Collection<NeatNetwork>} A collection of NEAT networks.
     */
    getNeatNetworks(): Collection<NeatNetwork> {
        return this.neatnetworks.toCollection();
    }

        
    async getGenerations(): Promise<any[]> {
        // console.info("getGenerations");
        const summary = new Map<string, {generationId: string, genomeCount: number, scoreSum: number, scoreAvg: number}>();
        let ret = await this.neatnetworks.each(neatnetwork => {
            // console.info("getGenerations each", neatnetwork);
            let genome:NeatNetwork = neatnetwork;
            let genomeId = genome.getGenerationId().toString();
            if (summary.has(genomeId)) {
                let genomeCount = summary.get(genomeId)!.genomeCount + 1;
                let scoreSum = summary.get(genomeId)!.scoreSum + neatnetwork.score;
                let scoreAvg = scoreSum / genomeCount;
                summary.set(genomeId, 
                    {
                        generationId: genome.getGenerationId().toString(), 
                        genomeCount: genomeCount,
                        scoreSum: scoreSum,
                        scoreAvg: scoreAvg
                    }
                )
        } else {
                summary.set(genomeId, 
                        {
                            generationId: genome.getGenerationId().toString(), 
                            genomeCount: 1,
                            scoreSum: neatnetwork.score,
                            scoreAvg: neatnetwork.score
                        }
                    )
            }
        }).then(()=> {
            // console.info("getGenerations then", summary);
            return Array.from(summary.values());
        });
        return ret;

    }

    getPopulationByGenerationId(generationId: string): Promise<any[][]> {
        return this.getNeatNetworksByGenerationId(generationId).toArray().then((data) => {
            return data.map(
                item => Object.values(item)
            );
        });
    }


    /**
     * Returns a collection of NeatNetworks that belong to a specific generation.
     * @param generationId The ID of the generation to retrieve NeatNetworks for.
     * @returns A collection of NeatNetworks that belong to the specified generation.
     */
    getNeatNetworksByGenerationId(generationId: string): Collection<NeatNetwork> {
        return this.neatnetworks.where("generationId").equals(generationId);
    }

    /**
     * Retrieves a collection of NeatNetwork objects from the database that match the specified ID.
     * @param id The ID of the NeatNetwork objects to retrieve.
     * @returns A collection of NeatNetwork objects that match the specified ID.
     */
    getNeatNetworkById(id: number): Collection<NeatNetwork> {
        return this.neatnetworks.where("id").equals(id);
    }

    /**
     * Stores a NeatNetwork in the database.
     * @param network The NeatNetwork to store.
     */
    async putNetwork(network: NeatNetwork) {
        await this.neatnetworks.put(network);
    }

    /**
     * Inserts multiple NeatNetwork objects into the database.
     * @param networks An array of NeatNetwork objects to insert.
     */
    async bulkPutNetwork(networks: NeatNetwork[]) {
        await this.neatnetworks.bulkPut(networks);
    }


    async updateNeatNetwork(generationId: Guid, populationIndex: number, fitness: number) {
        await this.neatnetworks.where({generationId: generationId.toString(), populationIndex: populationIndex}).modify({score: fitness});
    }
  

}

const neatNetworkDatabase = new NeatFlappyBirdDatabase();
export default neatNetworkDatabase;