import './style.css'
import { Pane } from 'tweakpane'
import { best, evolve } from './ga'
import type { Population } from './ga'
import { shuffle, range } from './array'
import { random } from './random'
import Two from 'two.js'

const app: HTMLElement = document.querySelector('#app')!

const two = new Two({
  fullscreen: true,
  autostart: true,
}).appendTo(app)

type EvolutionState = {
  two: Two
  cities: number
  generations: number
  individuals: number
  offspringRatio: number
  mutationRate: number
  seed: Array<City> | ''
  distance: number
}

const evolutionState: EvolutionState = {
  two: two,
  cities: 10,
  generations: 1000,
  individuals: 30,
  offspringRatio: 0.5,
  mutationRate: 1,
  seed: '',
  distance: -1,
}

const pane = new Pane({
  title: 'Configuration',
})

const cities = pane.addFolder({
  title: 'Cities',
})

cities.addInput(evolutionState, 'cities', {
  label: 'Cities',
  step: 1,
  min: 5,
  max: 50,
})

cities.addMonitor(evolutionState, 'seed', {
  view: 'textarea',
  multiline: true,
  lineCount: 2,
})

const gaParams = pane.addFolder({
  title: 'GA Params',
})

gaParams.addInput(evolutionState, 'generations', {
  label: 'Generations',
  step: 1,
  min: 1,
  max: 1000,
})

gaParams.addInput(evolutionState, 'individuals', {
  label: 'Individuals',
  step: 1,
  min: 2,
  max: 1000,
})

gaParams.addInput(evolutionState, 'offspringRatio', {
  label: 'Offspring ratio',
  step: 0.1,
  min: 0.1,
  max: 0.9,
})

gaParams.addInput(evolutionState, 'mutationRate', {
  label: 'Mutation rate',
  step: 1,
  min: 0,
  max: 50,
})

const generateButton = cities.addButton({
  title: 'Generate cities',
})

const runButton = pane.addButton({
  title: 'Run experiment',
  disabled: evolutionState.seed === '',
})

generateButton.on('click', () => {
  const seed = generateSeed(evolutionState)
  evolutionState.seed = seed
  runButton.disabled = false
})

runButton.on('click', () => {
  runButton.disabled = true
  setTimeout(() => {
    start(evolutionState)
  }, 100)
})

const monitorPane = pane.addFolder({
  title: 'Monitor',
})

monitorPane.addMonitor(evolutionState, 'distance', {})

type City = [number, number]

function generateSeed(state: EvolutionState): Array<City> {
  const width = two.width - pane.element.offsetWidth
  const height = two.height
  const cities: Array<City> = range(state.cities).map((_) => [random(0, width), random(0, height)])
  draw(two, 0, cities)

  return cities
}

function start(state: EvolutionState) {
  const individuals = range(state.individuals).map((_) => shuffle(state.seed as Array<City>))
  const fitness = (individual: Array<City>) => -1 * distance(individual)
  let population: Population<City> = {
    generation: 1,
    individuals,
    offspringRatio: state.offspringRatio,
    fitness,
    mutationRate: state.mutationRate,
  }

  runEvolution(state, population, state.two)
}

function runEvolution(state: EvolutionState, population: Population<City>, two: Two) {
  const _best = best(population)
  draw(two, population.generation, _best)
  state.distance = distance(_best)
  if (population.generation < state.generations) {
    setTimeout(() => {
      runEvolution(state, evolve(population), two)
    }, 0)
  } else {
    runButton.disabled = false
  }
}

function distance(a: Array<City>): number {
  return a
    .map((_, index): number => {
      const from = index
      const to = index < a.length - 1 ? index + 1 : 0
      const xLength = a[to][0] - a[from][0]
      const yLength = a[to][1] - a[from][1]
      return Math.sqrt(xLength * xLength + yLength * yLength)
    })
    .reduce((a, b) => a + b, 0)
}

function draw(two: Two, gen: number, route: Array<City>) {
  two.clear()
  const generation = two.makeText(`Generation: ${gen}`, 0, 10, {
    alignment: 'left',
  })
  generation.fill = 'rgb(255, 255, 255)'

  route.forEach((city, index) => {
    const marker = two.makeCircle(city[0], city[1], 10)
    marker.fill = 'rgb(255, 0, 0)'

    const from = route[index]
    const to = route[index < route.length - 1 ? index + 1 : 0]
    const line = two.makeLine(from[0], from[1], to[0], to[1])
    line.stroke = 'rgb(255, 0, 0)'
  })
}
