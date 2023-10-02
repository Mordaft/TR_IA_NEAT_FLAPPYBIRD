import { Neat, Network, architect, methods } from "neataptic";

export const MUTATION_RATE: number = 25;
export const START_HIDDEN_SIZE: number = 4;
export const INPUTS_SIZE: number = 3;
export const OUTPUTS_SIZE: number = 1;
export const ELITISM_PERCENT: number = 0.2;
export const INTERATIONS: number = 1000;
export const ERROR_TARGET: number = 0.05;

export class Brain {

    private brain!: Neat;
    private generation!: number;
    private fitnessFunction: any;
    private birdAmount: number;

    constructor(fitnessFunction: any, birdAmount: number) {
        this.fitnessFunction = fitnessFunction;
        this.birdAmount = birdAmount;
        //Variaciones probadas de redes neuronales..
        //let network: Network = architect.Random( INPUTS_SIZE, START_HIDDEN_SIZE, OUTPUTS_SIZE , null)
        let network: Network = architect.Perceptron(INPUTS_SIZE, START_HIDDEN_SIZE, OUTPUTS_SIZE);

        fetch('/trainingSet/data.json').then(response => {
            response.json().then(data => {
                // console.log(data);
                let traindata = data;
                network.evolve(data, {
                    mutation: methods.mutation.ALL,
                    equal: true,
                    popsize: this.birdAmount,
                    elitism: ELITISM_PERCENT * 100,
                    log: INTERATIONS / 10,
                    error: ERROR_TARGET,
                    iterations: INTERATIONS,
                    mutationRate: MUTATION_RATE / 100
                })
                    .then((result: any) => {
                        // console.log('Evolved!', result, network);
                        
                        traindata.forEach((element: any) => {
                            let output = network.activate(element.input, { trace: true });
                            console.log('input', element.input, 'output', Math.round(output)==1, 'expected', element.output==1);
                        });

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
                                methods.mutation.MOD_ACTIVATION,
                                // methods.mutation.ADD_GATE,
                                // methods.mutation.SUB_GATE,
                                // methods.mutation.ADD_SELF_CONN,
                                // methods.mutation.SUB_SELF_CONN,
                                // methods.mutation.ADD_BACK_CONN,
                                // methods.mutation.SUB_BACK_CONN
                            ],
                            popsize: this.birdAmount,
                            mutationRate: MUTATION_RATE,
                            elitism: Math.round(ELITISM_PERCENT * this.birdAmount),
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

    // createPopulation() {
    //     this.brain.evolve();
    //     this.generation++;
    // }
    

    createPopulation() {
        //  Evolution equivalent to brain.evolve(); but this isn't have errors...  --->
        this.brain.sort();
        // console.info('createPopulation: average score:', this.brain.getAverage());
        //Evolution equivalent to brain.evolve(); but this isn't have errors... -->
        // console.info('createPopulation: sorted last population', this.brain.population);
        let newPopulation = [];
        for (var i: number = 0; i < Math.abs(this.birdAmount * ELITISM_PERCENT); i++) {
            let genome = this.brain.population[i];
            newPopulation.push(genome);
        }
        for (var i: number = 0; i < (this.birdAmount - Math.abs(this.birdAmount * ELITISM_PERCENT)); i++) {
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
        this.createPopulation();
        return this.brain.population;
    }

    getGraph(index: number) {
        if (index >= 0) {
            return this.brain.population[index].graph(400, 600);
        }
        else return this.brain.population[0].graph(400, 600);
    }

}