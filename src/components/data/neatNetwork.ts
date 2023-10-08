import { Guid } from "guid-typescript";
import { Network } from "neataptic";

export class NeatNetwork { 
    private id!: number;
    private created: Date;
    private network: any;
    private score: number;
    private generationId: string;
    private populationIndex: number;

    /**
     * Creates a new instance of the NeatNetwork class.
     * @param network The network to be used.
     * @param generationId The ID of the generation.
     */
    constructor(network: Network, populationIndex: number, generationId: Guid, score: number){
        this.network = network.graph(600, 600);
        this.generationId = generationId.toString();
        this.score = score;
        this.populationIndex = populationIndex;
        this.created = new Date();
    }   

    /**
     * Returns the ID of the NEAT network.
     * @returns The ID of the NEAT network.
     */
    public getId(): number{
        return this.id;
    }
    /**
     * Returns the date when this NEAT network was created.
     * @returns {Date} The date when this NEAT network was created.
     */
    public getCreated(): Date{
        return this.created;
    }
    /**
     * Returns the current NEAT network.
     * @returns The current NEAT network.
     */
    public getNetwork(): Network{
        return this.network;
    }
    /**
     * Returns the unique identifier for the generation of this NEAT network.
     * @returns A Guid object representing the generation ID.
     */
    public getGenerationId(): Guid{
        return Guid.parse(this.generationId);
    }

    /**
     * Returns the score of the NEAT network.
     * @returns The score of the NEAT network.
     */
    public getScore(): number {    
        return this.score;
    }

    /**
     * Returns the population index of the NEAT network.
     * @returns The population index of the NEAT network.
     */
    public getPopulationIndex(): number {    
        return this.populationIndex;
    }
}