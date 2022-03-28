import {EntityRepository, getCustomRepository, In, Repository} from 'typeorm';
import {BigGame} from "../entities/BigGame";
import {Admin} from "../entities/Admin";
import {Team} from "../entities/Team";
import {Game, GameStatus, GameType} from "../entities/Game";
import {Round} from "../entities/Round";
import {GameRepository} from "./gameRepository";

@EntityRepository(BigGame)
export class BigGameRepository extends Repository<BigGame> {
    findByName(name: string) {
        return this.findOne({name}, {relations: ['games', 'teams']});
    }

    findWithAllRelations(bigGameId: string) {
        return this.findOne(bigGameId, {relations: ['games', 'teams', 'games.rounds', 'games.rounds.questions']});
    }

    findAmIParticipate(userId: string) {
        return this.createQueryBuilder("bigGames")
            .leftJoinAndSelect("bigGames.teams", "teams")
            .leftJoinAndSelect("teams.captain", "users")
            .where('teams.captain.id = :id', {id: userId})
            .getMany();
    }

    insertByParams(name: string,
                   adminEmail: string,
                   roundCount: number,
                   questionCount: number,
                   questionCost: number,
                   questionTime: number,
                   teams: string[]) {
        return this.manager.transaction(async manager => {
            const admin = await manager.findOne(Admin, {email: adminEmail});
            const teamsFromDb = await manager.find(Team, {name: In(teams)});
            const bigGame = await manager.create(BigGame, {name, admin, teams: teamsFromDb});
            await manager.save(bigGame);

            const game = await manager.create(Game, {type: GameType.CHGK, bigGame});
            await manager.save(game);

            await getCustomRepository(GameRepository).createRoundsWithQuestions(roundCount, questionCount, manager, game, questionTime, questionCost);

            return bigGame;
        });
    }

    updateByParams(bigGameId: string,
                   newName: string,
                   roundCount: number,
                   questionCount: number,
                   questionCost: number,
                   questionTime: number,
                   teams: string[]) {
        return this.manager.transaction(async manager => {
            const teamsFromDb = await manager.find(Team, {name: In(teams)});
            const bigGame = await manager.findOne(BigGame, bigGameId, {relations: ['games']});
            bigGame.teams = teamsFromDb;
            bigGame.name = newName;
            await manager.save(bigGame);

            const game = bigGame.games.find(game => game.type == GameType.CHGK);
            await manager.delete(Round, {game});

            await getCustomRepository(GameRepository).createRoundsWithQuestions(roundCount, questionCount, manager, game, questionTime, questionCost);

            return bigGame;
        });
    }

    updateNameById(bigGameId: string, newName: string) {
        return this.manager.transaction(async manager => {
            const bigGame = await manager.findOne(BigGame, bigGameId);
            bigGame.name = newName;

            return manager.save(bigGame);
        });
    }

    updateAdminByIdAndAdminEmail(bigGameId: string, newAdminEmail: string) {
        return this.manager.transaction(async manager => {
            const admin = await manager.findOne(Admin, {email: newAdminEmail});
            const bigGame = await manager.findOne(BigGame, bigGameId);
            bigGame.admin = admin;

            return manager.save(bigGame);
        });
    }

    updateByGameIdAndStatus(bigGameId: string, newStatus: GameStatus) {
        return this.manager.transaction(async manager => {
            const bigGame = await manager.findOne(BigGame, bigGameId);
            bigGame.status = newStatus;

            return manager.save(bigGame);
        })
    }
}