import { Neat, Network, architect, methods } from "neataptic";

export const BIRD_AMOUNT: number = 100;
export const MUTATION_RATE: number = 15;
export const START_HIDDEN_SIZE: number = 4;
export const INPUTS_SIZE: number = 3;
export const OUTPUTS_SIZE: number = 1;
export const ELITISM_PERCENT: number = 0.2;
export const BLOCK_SIZE: number = 60;
export const INTERATIONS: number = 5000;
export const ERROR_TARGET: number = 0.01;

export class Brain {

    private brain!: Neat;
    private generation!: number;
    private fitnessFunction: any;

    constructor(fitnessFunction: any) {
        this.fitnessFunction = fitnessFunction;
        //Variaciones probadas de redes neuronales..
        //let network: Network = architect.Random( INPUTS_SIZE, START_HIDDEN_SIZE, OUTPUTS_SIZE , null)
        let network: Network = architect.Perceptron(INPUTS_SIZE, START_HIDDEN_SIZE, OUTPUTS_SIZE);

        fetch('/trainingSet/data.json').then(response => {
            response.json().then(data => {
                console.log(data);
                network.evolve(data, {
                    mutation: methods.mutation.ALL,
                    equal: true,
                    popsize: BIRD_AMOUNT,
                    elitism: ELITISM_PERCENT * 100,
                    log: INTERATIONS / 100,
                    error: ERROR_TARGET,
                    iterations: INTERATIONS,
                    mutationRate: MUTATION_RATE / 100
                })
                    .then((result: any) => {
                        console.log('Evolved!', result, network);
                        // network.train(data, {
                        //         error: ERROR_TARGET
                        //     });
                        // console.log('Trained!', network);

                        this.brain = new Neat(INPUTS_SIZE, OUTPUTS_SIZE, this.fitnessFunction, {
                            mutation: [
                                // methods.mutation.ADD_NODE,
                                // methods.mutation.SUB_NODE,
                                // methods.mutation.ADD_CONN,
                                // methods.mutation.SUB_CONN,
                                methods.mutation.MOD_WEIGHT,
                                methods.mutation.MOD_BIAS,
                                //methods.mutation.MOD_ACTIVATION,
                                // methods.mutation.ADD_GATE,
                                // methods.mutation.SUB_GATE,
                                // methods.mutation.ADD_SELF_CONN,
                                // methods.mutation.SUB_SELF_CONN,
                                // methods.mutation.ADD_BACK_CONN,
                                // methods.mutation.SUB_BACK_CONN
                            ],
                            popsize: BIRD_AMOUNT,
                            mutationRate: MUTATION_RATE,
                            elitism: Math.round(ELITISM_PERCENT * BIRD_AMOUNT),
                            network: network,
                            equal: true
                        }
                        );

                        this.generation = 1;

                    }).catch((err: any) => {
                        console.error(err);
                    });

            }).catch(err => {
                console.log(err);
            });
        });
    }


    createPopulation() {
        this.brain.sort();
        console.info('createPopulation: average score:', this.brain.getAverage());
        //Evolution equivalent to brain.evolve(); but this isn't have errors... -->
        // console.info('createPopulation: sorted last population', this.brain.population);
        let newPopulation = [];
        for (var i: number = 0; i < Math.abs(BIRD_AMOUNT * ELITISM_PERCENT); i++) {
            let genome = this.brain.population[i];
            newPopulation.push(genome);
        }
        for (var i: number = 0; i < (BIRD_AMOUNT - Math.abs(BIRD_AMOUNT * ELITISM_PERCENT)); i++) {
            let genome = this.brain.getOffspring();
            newPopulation.push(genome);
        }
        this.brain.population = newPopulation;
        //Evolution equivalent to brain.evolve(); but this isn't have errors...  <---
        this.brain.mutate();
        // console.info('createPopulation: mutated population', this.brain.population);
        this.generation++;

    }

    getGeneration(): number {
        return this.generation;
    }

    getPopulation(): Network[] {
        return this.brain.population;
    }

    getGraph(index: number) {
        if (index >= 0) {
            return this.brain.population[index].graph(400, 600);
        }
        else return this.brain.population[0].graph(400, 600);
    }

}