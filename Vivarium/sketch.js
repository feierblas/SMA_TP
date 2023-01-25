let agents, items, state, time_gameStarted, buttonStart, buttonRestart, bestEspaceEver = null

function setup() {
  console.log("----- Setup Start -----")
  createCanvas(950,650)
  frameRate(30)

  state = GameState.TO_START
  loadComponents()
  createBtn()
  console.log("----- Setup Finish -----")
}
const createBtn = () => {
  buttonStart = createButton("Start Game")
  buttonStart.mousePressed(btnGameStart)
  buttonStart.style('display', 'none')
  buttonRestart = createButton("Return to Home")
  buttonRestart.mousePressed(btnGameEnd)
  buttonRestart.style('display', 'none')
}
const loadComponents = () => {
  agents = []
  items = []
  time_gameStarted = millis()

  for (let i = 0; i < Scenario.SuperPredateur.nb; i++)
    agents.push(new Agent(Espece.SUPERPREDATEUR,
        Scenario.SuperPredateur.parametres.vitesse,
        Scenario.SuperPredateur.parametres.acceleration,
        Scenario.SuperPredateur.parametres.faim,
        Scenario.SuperPredateur.parametres.fatigue,
        Scenario.SuperPredateur.parametres.reproduction,
        Scenario.SuperPredateur.parametres.esperance,
        Scenario.SuperPredateur.parametres.radius
    ))
  for (let i = 0; i < Scenario.Carnivore.nb; i++)
    agents.push(new Agent(Espece.CARNIVORE,
        Scenario.Carnivore.parametres.vitesse,
        Scenario.Carnivore.parametres.acceleration,
        Scenario.Carnivore.parametres.faim,
        Scenario.Carnivore.parametres.fatigue,
        Scenario.Carnivore.parametres.reproduction,
        Scenario.Carnivore.parametres.esperance,
        Scenario.Carnivore.parametres.radius
    ))
  for (let i = 0; i < Scenario.Herbivore.nb; i++)
    agents.push(new Agent(Espece.HERBIVORE,
        Scenario.Herbivore.parametres.vitesse,
        Scenario.Herbivore.parametres.acceleration,
        Scenario.Herbivore.parametres.faim,
        Scenario.Herbivore.parametres.fatigue,
        Scenario.Herbivore.parametres.reproduction,
        Scenario.Herbivore.parametres.esperance,
        Scenario.Herbivore.parametres.radius
    ))
  for (let i = 0; i < Scenario.Décomposeur.nb; i++)
    agents.push(new Agent(Espece.DECOMPOSEUR,
        Scenario.Décomposeur.parametres.vitesse,
        Scenario.Décomposeur.parametres.acceleration,
        Scenario.Décomposeur.parametres.faim,
        Scenario.Décomposeur.parametres.fatigue,
        Scenario.Décomposeur.parametres.reproduction,
        Scenario.Décomposeur.parametres.esperance,
        Scenario.Décomposeur.parametres.radius
    ))

  for (let i = 0; i < Scenario.Vegetaux.nb; i++) {
    items.push(new Item())
  }
}
const computePerception = agent => {
  agent.body.fustrum.perceptionList = []
  agents.map(a => {
    if (a.uid !== agent.uid)
      if (agent.body.fustrum.inside(a.body)) {
        agent.body.fustrum.perceptionList.push(a.body)
      }
  })

  items.map(item => {
    if (agent.body.fustrum.inside(item)) {
      agent.body.fustrum.perceptionList.push(item)
    }
  })
}
const computeDecision = agent => {
  agent.update()
}
const applyDecision = agent => {
  agent.body.update()
}
const environnement = () => {
  let superpredateur = 0, carnivore = 0, herbivore = 0, decomposeur = 0

  agents.map(agent => {
    items.map(item => {
      if(dist(agent.body.pos.x, agent.body.pos.y, item.pos.x, item.pos.y) <= agent.body.radius/2) {
        if (agent.espece === Espece.HERBIVORE) {
          agent.body.jaugeFaim.value = agent.body.jaugeFaim.value > 20 ? agent.body.jaugeFaim.value - 20 : 0
          items = items.filter(i => i != item)
          if (Math.round(random(0, 100)) < Scenario.Vegetaux.respawn)
            items.push(new Item())
        } else if (agent.espece === Espece.DECOMPOSEUR) {
          agents = agents.filter(a => a.uid != agent.uid)
        }
      }
    })
  })

  agents.map(agentA => {
    agents.map(agentB => {
      if (agentA.uid != agentB.uid){
        if(dist(agentA.body.pos.x, agentA.body.pos.y, agentB.body.pos.x, agentB.body.pos.y) <= agentA.body.radius / 2 + agentB.body.radius / 2) {
          switch (agentA.espece){
            case Espece.SUPERPREDATEUR :
              if (agentB.espece === Espece.CARNIVORE && !agentB.body.mort && !agentA.body.mort){
                agentA.body.jaugeFaim.value = agentA.body.jaugeFaim.value > 20 ? agentA.body.jaugeFaim.value - 20 : 0
                agents = agents.filter(a => a.uid != agentB.uid)
              }
              break
            case Espece.CARNIVORE :
              if (agentB.espece === Espece.HERBIVORE && !agentB.body.mort && !agentA.body.mort){
                agentA.body.jaugeFaim.value = agentA.body.jaugeFaim.value > 20 ? agentA.body.jaugeFaim.value - 20 : 0
                agents = agents.filter(a => a.uid != agentB.uid)
              }
              break
            case Espece.DECOMPOSEUR :
              if (agentB.body.mort){
                agentA.body.jaugeFaim.value = agentA.body.jaugeFaim.value > 20 ? agentA.body.jaugeFaim.value - 20 : 0
                agents = agents.filter(a => a.uid != agentB.uid)
              }
              break
          }
        }
      }
    })
  })

  // On pourrais le faire dans le for d'avant, mais j'ai décider de le faire à part, pour différencier ceux deux for
  agents.map(agent => {
    if (agent.body.reproduction()) {
      const children = new Agent(agent)
      agents.push(children)
      agent.body.jaugeReproduction.value = 0
    }
    if (!agent.body.mort) {
      agent.espece === Espece.SUPERPREDATEUR && superpredateur++
      agent.espece === Espece.CARNIVORE && carnivore++
      agent.espece === Espece.HERBIVORE && herbivore++
      agent.espece === Espece.DECOMPOSEUR && decomposeur++
    }
  })
  calculateBestEspece()

  // SI respawn activer !
  if (Scenario.respawn)
    respawn(superpredateur, carnivore, herbivore, decomposeur)
}
const respawn = (superpredateur, carnivore, herbivore, decomposeur) => {
  superpredateur === 0 && agents.push(new Agent(Espece.SUPERPREDATEUR,
      Scenario.SuperPredateur.parametres.vitesse,
      Scenario.SuperPredateur.parametres.acceleration,
      Scenario.SuperPredateur.parametres.faim,
      Scenario.SuperPredateur.parametres.fatigue,
      Scenario.SuperPredateur.parametres.reproduction,
      Scenario.SuperPredateur.parametres.esperance,
      Scenario.SuperPredateur.parametres.radius
  ))
  carnivore === 0 && agents.push(new Agent(Espece.CARNIVORE,
        Scenario.Carnivore.parametres.vitesse,
        Scenario.Carnivore.parametres.acceleration,
        Scenario.Carnivore.parametres.faim,
        Scenario.Carnivore.parametres.fatigue,
        Scenario.Carnivore.parametres.reproduction,
        Scenario.Carnivore.parametres.esperance,
        Scenario.Carnivore.parametres.radius
    ))
  herbivore === 0 && agents.push(new Agent(Espece.HERBIVORE,
        Scenario.Herbivore.parametres.vitesse,
        Scenario.Herbivore.parametres.acceleration,
        Scenario.Herbivore.parametres.faim,
        Scenario.Herbivore.parametres.fatigue,
        Scenario.Herbivore.parametres.reproduction,
        Scenario.Herbivore.parametres.esperance,
        Scenario.Herbivore.parametres.radius
    ))
  decomposeur === 0 && agents.push(new Agent(Espece.DECOMPOSEUR,
        Scenario.Décomposeur.parametres.vitesse,
        Scenario.Décomposeur.parametres.acceleration,
        Scenario.Décomposeur.parametres.faim,
        Scenario.Décomposeur.parametres.fatigue,
        Scenario.Décomposeur.parametres.reproduction,
        Scenario.Décomposeur.parametres.esperance,
        Scenario.Décomposeur.parametres.radius
    ))
}
const calculateBestEspece = () => {
  let bestAgent = null

  agents.map(agent => {
    if (agent.espece !== Espece.DECOMPOSEUR && !agent.body.mort) {
      agent.body.bestEspace = false
      if (bestAgent == null)
        bestAgent = agent
      if (agent.body.capacity() > bestAgent.body.capacity())
        bestAgent = agent
    } else
      agent.body.bestEspace = false
  })
  if (bestAgent !== null) {
    bestAgent.body.bestEspace = true
    if (bestEspaceEver === null)
      bestEspaceEver = bestAgent
    else if (bestAgent.body.capacity() > bestEspaceEver.body.capacity())
      bestEspaceEver = bestAgent
  }

  //Afficher dans la console, l’individu ayant la meilleur génétique
  if (bestAgent !== null) {
    console.log("----------------------------------------------------------")
    console.log("L'individu ayant la meilleure génétique existant")
    console.log("Espece : " + bestAgent.espece)
    console.log("Mobilité (max) => Vitesse : " + bestAgent.body.vitesseMax.toFixed(2) + " & Acceleration : " + bestAgent.body.accelerationMax.toFixed(2))
    console.log("Jauge (max) => faim : " + bestAgent.body.jaugeFaim.max + " & fatigue : " + bestAgent.body.jaugeFatigue.max + " & reproduction : " + bestAgent.body.jaugeReproduction.max)
    console.log("Autre (max) => Esperance de vie : " + (bestAgent.body.esperanceWithoutModification) + " & Radius : " + bestAgent.body.fustrum.radius)
  }
}
const display = () => {
  // Afficher dans la console le pourcentage de la population
  let superpredateur = 0, carnivore = 0, herbivore = 0, decomposeur = 0, total = 0
  agents.map(agent => {
    if (!agent.body.mort) {
      switch (agent.espece){
        case Espece.SUPERPREDATEUR :
          superpredateur++
          break
        case Espece.CARNIVORE :
          carnivore++
          break
        case Espece.HERBIVORE :
          herbivore++
          break
        case Espece.DECOMPOSEUR :
          decomposeur++
          break
      }
      total++
    }

  })
  console.log("----------------------------------------------------------")
  console.log("Population total : " + total)
  if (total > 0 ){
    console.log("Superpredateur : " + superpredateur + " (" + (superpredateur/total * 100).toFixed(0) + "%)")
    console.log("Carnivore : " + carnivore + " (" + (carnivore/total * 100 ).toFixed(0)  + "%)")
    console.log("Herbivore : " + herbivore + " (" + (herbivore/total * 100).toFixed(0)+ "%)")
    console.log("Décomposeur : " + decomposeur + " (" + (decomposeur/total * 100).toFixed(0) + "%)")
  }

}
const btnGameStart = () => {
  loadComponents()
  state = GameState.STARTED
  buttonStart.style('display', 'none')
}
const btnGameEnd = () => {
  state = GameState.TO_START
  time_gameStarted = millis()
  buttonRestart.style('display', 'none')
  buttonStart.style('display', 'block')
}
const game_started = () => {
  if (Math.round(millis()/1000 - time_gameStarted/1000) >= Scenario.duréeSimu)
    state = GameState.OVER
  background(255)

  agents.map(agent => {
    agent.show()
  })

  items.map(item => {
    item.show()
  })

  agents.map(agent => {
    computePerception(agent)
  })

  agents.map(agent => {
    computeDecision(agent)
  })

  agents.map(agent => {
    applyDecision(agent)
  })

  environnement()
  display()
}
const game_over = () => {
  buttonRestart.style('display', 'block')
  background(180)
  textAlign(CENTER, CENTER)
  fill(255,0,0)
  textSize(32)
  text("La simulation est fini !", width/2, 50)
  if (bestEspaceEver !== null) {
    text("L'individu ayant la meilleure génétique durant tout le jeu :", width/2, 150)
    text("Espece : " + bestEspaceEver.espece, width/2, 200)
    text("Mobilité (max) => Vitesse : " + bestEspaceEver.body.vitesseMax.toFixed(2) + " & Acceleration : " + bestEspaceEver.body.accelerationMax.toFixed(2), width/2, 250)
    text("Jauge (max) => faim : " + bestEspaceEver.body.jaugeFaim.max + " & fatigue : " + bestEspaceEver.body.jaugeFatigue.max + " & reproduction : " + bestEspaceEver.body.jaugeReproduction.max, width/2, 300)
    text("Autre (max) => Esperance de vie : " + (bestEspaceEver.body.esperanceWithoutModification) + " & Radius : " + bestEspaceEver.body.fustrum.radius, width/2, 350)
  } else {
    text("Bizzare.... il n'y a pas eu de meilleure individu ? on dirait que vous avez simuler sans espece ou juste avec des décomposeur :", width/2, 150)
  }
  buttonRestart.size(220, 100)
  buttonRestart.position(width/2 - buttonRestart.width/2, 450)
  buttonRestart.style('font-size', '32px')
  buttonRestart.style('background-color', 'red')
  buttonRestart.style('color', 'white')
  buttonRestart.style('padding', '12px')
}
const game_toStart = () => {
  background(180)
  buttonStart.style('display', 'block')
  buttonStart.size(220, 100)
  buttonStart.position(width/2 - buttonStart.width/2, height/2 - buttonStart.height/2)
  buttonStart.style('font-size', '32px')
  buttonStart.style('background-color', 'red')
  buttonStart.style('color', 'white')
  buttonStart.style('padding', '12px')
}

function draw() {
  switch (state) {
    case GameState.TO_START :
      game_toStart()
      break
    case GameState.STARTED :
      game_started()
      break
    case GameState.OVER :
      game_over()
      break
  }
}