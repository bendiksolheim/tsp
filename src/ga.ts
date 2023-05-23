import { range, swap } from './array'
import { random } from './random'

export type Population<T> = {
  generation: number
  individuals: Array<Array<T>>
  offspringRatio: number
  fitness: (individual: Array<T>) => number
  mutationRate: number
}

export function evolve<T>(population: Population<T>): Population<T> {
  const { generation, individuals, offspringRatio, fitness, mutationRate } = population
  const cutoff = Math.floor(individuals.length * offspringRatio)
  const offspringCount = individuals.length - cutoff
  const sortFn = sorter(fitness)
  const selectionPool = [...individuals].sort(sortFn).slice(0, offspringCount)
  const offspring = range(offspringCount).map((_) => {
    let a = selectionPool[random(0, selectionPool.length)]
    let b = selectionPool[random(0, selectionPool.length)]
    let crossover = random(1, a.length - 2)
    return mutate(simpleSwapCrossover(a, b, crossover), mutationRate)
  })
  const nextGeneration = selectionPool.concat(offspring)
  return { ...population, individuals: nextGeneration, generation: generation + 1 }
}

export function best<T>(population: Population<T>): Array<T> {
  const individuals = [...population.individuals]
  const sortFn = sorter(population.fitness)
  return individuals.sort(sortFn)[0]
}

function sorter<T>(
  fitness: (individual: Array<T>) => number
): (a: Array<T>, b: Array<T>) => number {
  return (a, b) => {
    return fitness(b) - fitness(a)
  }
}

function simpleSwapCrossover<T>(a: Array<T>, b: Array<T>, crossover: number): Array<T> {
  let offspring = a.slice(0, crossover)
  b.forEach((gene) => {
    if (offspring.findIndex((el) => JSON.stringify(el) === JSON.stringify(gene)) === -1) {
      offspring.push(gene)
    }
  })

  return offspring
}

function mutate<T>(a: Array<T>, rate: number): Array<T> {
  var sequence = [...a]
  range(rate).forEach((_) => {
    let x = random(0, a.length)
    let y = random(0, a.length)
    sequence = swap(a, x, y)
  })
  return sequence
}
