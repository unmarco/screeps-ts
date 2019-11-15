export class DefenseManager implements Manager {

  public name = "DefenseManager";

  public doBefore(): void {
    // DO NOTHING
  }

  public manageRoom(room: Room): void {
    const towers: AnyOwnedStructure[] = room.find(FIND_MY_STRUCTURES, {
      filter: (s: AnyOwnedStructure) => s.structureType === STRUCTURE_TOWER
    })

    if (towers.length > 0) {
      const wallHitpoints = room.memory.hits.walls;
      const rampartHitpoints = room.memory.hits.ramparts;
      // console.log(`Wall: ${wallHitpoints} Rampart: ${rampartHitpoints}`);

      towers.forEach((t: AnyOwnedStructure) => {
        const tower = t as StructureTower;

        const enemies = room.find(FIND_HOSTILE_CREEPS);

        if (enemies.length > 0) {
          tower.attack(enemies[0]);
          return;
        }

        const wallsAndRampartsToRepair = t.pos.findInRange(FIND_STRUCTURES, 20, {
          filter: (s: AnyStructure) => {
            return (s.structureType === STRUCTURE_WALL && s.hits < wallHitpoints) ||
              (s.structureType === STRUCTURE_RAMPART && s.hits < rampartHitpoints);
          }
        });

        wallsAndRampartsToRepair.sort((a: AnyStructure, b: AnyStructure) => {
          const maxHitsA = a.structureType === STRUCTURE_WALL ? wallHitpoints : rampartHitpoints;
          const maxHitsB = b.structureType === STRUCTURE_WALL ? wallHitpoints : rampartHitpoints;
          return (maxHitsB - b.hits) - (maxHitsA - a.hits);
        })

        if (wallsAndRampartsToRepair.length > 0) {
          // console.log(`Found ${wallsAndRampartsToRepair.length} walls/rampart to repair`);
          tower.repair(wallsAndRampartsToRepair[0]);
        }
      })
    }
  }

  public updateUI(room: Room) {
    // DO NOTHING
  }
}
