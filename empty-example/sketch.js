let agents = []
let items = []
const totalOfPopulation = 30

function setup() {
  console.log("Setup Start -----")
  createCanvas(950,500);
  frameRate(30);

  for (let i = 0; i < Scenario.SuperPredateur.nb; i++)
    agents.push(new Agent("superpredateur",
        Scenario.SuperPredateur.parametres.vitesseMax,
        Scenario.SuperPredateur.parametres.accelerationMax,
        Scenario.SuperPredateur.parametres.faimMax,
        Scenario.SuperPredateur.parametres.fatigueMax,
        Scenario.SuperPredateur.parametres.reproductionMax,
        Scenario.SuperPredateur.parametres.esperanceMax
    ))
  for (let i = 0; i < Scenario.Carnivore.nb; i++)
  agents.push(new Agent("carnivore",
      Scenario.Carnivore.parametres.vitesseMax,
      Scenario.Carnivore.parametres.accelerationMax,
      Scenario.Carnivore.parametres.faimMax,
      Scenario.Carnivore.parametres.fatigueMax,
      Scenario.Carnivore.parametres.reproductionMax,
      Scenario.Carnivore.parametres.esperanceMax
  ))
  for (let i = 0; i < Scenario.Herbivore.nb; i++)
    agents.push(new Agent("herbivore",
        Scenario.Herbivore.parametres.vitesseMax,
        Scenario.Herbivore.parametres.accelerationMax,
        Scenario.Herbivore.parametres.faimMax,
        Scenario.Herbivore.parametres.fatigueMax,
        Scenario.Herbivore.parametres.reproductionMax,
        Scenario.Herbivore.parametres.esperanceMax
    ))
  for (let i = 0; i < Scenario.Décomposeur.nb; i++)
  agents.push(new Agent("decomposeur",
      Scenario.Décomposeur.parametres.vitesseMax,
      Scenario.Décomposeur.parametres.accelerationMax,
      Scenario.Décomposeur.parametres.faimMax,
      Scenario.Décomposeur.parametres.fatigueMax,
      Scenario.Décomposeur.parametres.reproductionMax,
      Scenario.Décomposeur.parametres.esperanceMax
  ))

  for (let i = 0; i < Scenario.Vegetaux.nb; i++) {
    items.push(new Item())
  }
  console.log("Setup End -----")
}

const computePerception = agent => {
  agent.body.fustrum.perceptionList = []
  agents.map(a => {
    if (a.uid !== agent.uid)
      if (agent.body.fustrum.inside(a.body)) {
        agent.body.fustrum.perceptionList.push(agent)
      }
  })

  items.map(item => {
    if (agent.body.fustrum.inside(item)) {
      agent.body.fustrum.perceptionList.push(item)
    }
  })
}
const computeDecision = agent => {
  agent.update();
}
const applyDecision = agent => {
  agent.body.update();
}

const environnement = () => {
  agents.map(agent => {
    items.map(item => {
      if(dist(agent.body.pos.x, agent.body.pos.y, item.pos.x, item.pos.y) <= agent.body.fustrum.radius) {
        if (agent.espece === "herbivore") {
          items = items.filter(i => i != item)
        } else if (agent.espece === "decomposeur") {
          agents = agents.filter(a => a.uid != agent.uid)
        }
      }
    })
  })

  agents.map(agentA => {
    agents.map(agentB => {
      if (agentA.uid != agentB.uid){
        // console.log(dist(agentA.body.pos.x, agentA.body.pos.y, agentB.body.pos.x, agentB.body.pos.y))
        if(dist(agentA.body.pos.x, agentA.body.pos.y, agentB.body.pos.x, agentB.body.pos.y) <= agentA.body.fustrum.radius / 2 +agentB.body.fustrum.radius / 2) {
          switch (agentA.espece){
            case "superpredateur" :
              if (agentB.espece === "carnivore"){
                agentA.body.jaugeFaim.value-=20
                agents = agents.filter(a => a.uid != agentB.uid)
              }
              break
            case "carnivore" :
              if (agentB.espece === "herbivore"){
                agentA.body.jaugeFaim.value-=20
                agents = agents.filter(a => a.uid != agentB.uid)
              }
              break
            case "decomposeur" :
              if (agentB.body.mort){
                agentA.body.jaugeFaim.value-=20
                agents = agents.filter(a => a.uid != agentB.uid)
              }
              break
          }
        }
      }
    })
  })
}

function draw() {
  background(255);

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
}
