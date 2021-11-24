import {EntityRepository, Repository} from 'typeorm';
import {User} from '../entities/User';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    findByEmail(email: string) {
        return this.findOne({email});
    }

    findUsersWithoutTeam() {
        return this.find({relations: ['team']})
            .then(users => users.filter(user => user.team === null))
    }

    insertByEmailAndPassword(email: string, password: string) {
        return this.insert({email, password});
    }

    updateByEmailAndPassword(email: string, password: string) {
        return this.update({email}, {password});
    }
}
