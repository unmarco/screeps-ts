import { Manager } from "types";
import { getConfig } from "roles/role-util";

export class DefenseManager implements Manager {
    public doBefore(): void {
        // DO NOTHING
    }

    public manageRoom(room: Room): void {
        const towers: AnyOwnedStructure[] = room.find(FIND_MY_STRUCTURES, {
            filter: (s: AnyOwnedStructure) => s.structureType === STRUCTURE_TOWER
        })

        if (towers.length > 0) {
            const wallHitpoints = getConfig(room.name).wallHitpoints;
            const rampartHitpoints = getConfig(room.name).rampartHitpoints;

            towers.forEach((t: AnyOwnedStructure) => {
                const tower = t as StructureTower;
                const wallsInNeed = room.find(FIND_STRUCTURES, {
                    filter: (s: AnyStructure) => {
                        return (s.structureType === STRUCTURE_WALL && s.hits < wallHitpoints) ||
                            (s.structureType === STRUCTURE_RAMPART && s.hits < rampartHitpoints);
                    }
                });

                if (wallsInNeed.length > 0) {
                    tower.repair(wallsInNeed[0]);
                }
            })
        }
    }


}
