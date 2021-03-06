// Nest dependencies
import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

// Other dependencies
import { Validator } from 'class-validator'

// Local files
import { EntriesRepository } from 'src/shared/Repositories/entries.repository'
import { EntriesEntity } from 'src/shared/Entities/entries.entity'
import { CreateEntryDto } from '../Dto/create-entry.dto'
import { TitlesRepository } from 'src/shared/Repositories/title.repository'
import { serializerService, ISerializeResponse } from 'src/shared/Services/serializer.service'
import { UsersRepository } from 'src/shared/Repositories/users.repository'

@Injectable()
export class EntryService {

    private validator: Validator

    constructor(
        @InjectRepository(EntriesRepository)
        private readonly entriesRepository: EntriesRepository,
        @InjectRepository(TitlesRepository)
        private readonly titlesRepository: TitlesRepository,
        @InjectRepository(UsersRepository)
        private readonly usersRepository: UsersRepository,
    ) {
        this.validator = new Validator()
    }

    async getEntry(entryId: string): Promise<ISerializeResponse> {
        if (!this.validator.isMongoId(entryId)) throw new BadRequestException('EntryId must be a MongoId.')

        const entry: EntriesEntity = await this.entriesRepository.getEntry(entryId)
        return serializerService.serializeResponse('entry_detail', entry)
    }

    async getEntriesByTitleId({ titleId, query }: {
         titleId: string,
         query: {
             skip: number,
             sortBy: 'newest' | 'top'
        }
    }): Promise<ISerializeResponse> {
        const result = await this.entriesRepository.getEntriesByTitleId({ titleId, query })
        return serializerService.serializeResponse('entry_list', result)
    }

    async getEntriesByAuthorOfIt({ username, query }: {
        username: string,
        query: { skip: number }
    }): Promise<ISerializeResponse> {
       const result = await this.entriesRepository.getEntriesByAuthorOfIt({ username, query })
       return serializerService.serializeResponse('entry_list_of_author', result)
    }

    async getFeaturedEntryByTitleId({ titleId }: { titleId: string }): Promise<ISerializeResponse> {
        const result = await this.entriesRepository.getFeaturedEntryByTitleId({ titleId })
        return serializerService.serializeResponse('featured_entry', result)
    }

    async updateEntry(username: string, entryId: string, text: string): Promise<ISerializeResponse> {
        if (!this.validator.isMongoId(entryId)) throw new BadRequestException('EntryId must be a MongoId.')

        const entry: EntriesEntity = await this.entriesRepository.updateEntry(username, entryId, text)
        return serializerService.serializeResponse('entry_detail', entry)
    }

    async createEntry(writtenBy: string, dto: CreateEntryDto): Promise<HttpException | ISerializeResponse> {
        dto.text = dto.text.replace(/^\s+|\s+$/g, '')
        if (dto.text.length === 0) throw new BadRequestException('Entry text can not be whitespace')

        try {
            await this.titlesRepository.updateEntryCount(dto.titleId, 1)
        } catch (err) {
            throw new BadRequestException(`${dto.titleId} does not match in the database`)
        }

        const newEntry: EntriesEntity = await this.entriesRepository.createEntry(writtenBy, dto)
        return serializerService.serializeResponse('updated_entry', newEntry)
    }

    async undoVoteOfEntry({ entryId, username, isUpVoted }: { entryId: string, username: string, isUpVoted: boolean }): Promise<HttpException> {
        if (!this.validator.isMongoId(entryId)) throw new BadRequestException('EntryId must be a MongoId.')

        try {
            await this.entriesRepository.findOneOrFail(entryId)
        } catch (e) {
            throw new BadRequestException('Entry with that id could not found in the database')
        }

        await this.entriesRepository.undoVoteOfEntry({ entryId, isUpVoted, username })
        throw new HttpException('Entry has been un voted.', HttpStatus.OK)
    }

    async voteEntry({ entryId, username, isUpVoted }: { entryId: string, username: string, isUpVoted: boolean }): Promise<HttpException> {
        if (!this.validator.isMongoId(entryId)) throw new BadRequestException('EntryId must be a MongoId.')

        try {
            await this.entriesRepository.findOneOrFail(entryId)
        } catch (e) {
            throw new BadRequestException('Entry could not found by given id')
        }

        await this.entriesRepository.voteEntry({ entryId, isUpVoted, username })
        throw new HttpException('Entry has been voted.', HttpStatus.OK)
    }

    async deleteEntry(username: string, role: number, entryId: string): Promise<HttpException> {
        if (!this.validator.isMongoId(entryId)) throw new BadRequestException('EntryId must be a MongoId.')
        await this.usersRepository.getUserByUsername(username)

        const entry: EntriesEntity = await this.entriesRepository.deleteEntry(username, role, entryId)
        await this.titlesRepository.updateEntryCount(entry.title_id, -1)
        throw new HttpException('Entry has been deleted.', HttpStatus.OK)
    }

    async deleteEntriesBelongsToUsername(username: string): Promise<HttpException> {
        await this.usersRepository.getUserByUsername(username)
        const entries: EntriesEntity[] = await this.entriesRepository.deleteEntriesBelongsToUsername(username)
        // Get get entry count belongs to title id
        const entriesWithTitleId = [...entries.reduce((previous, current) => {
            if(!previous.has(current.title_id)) previous.set(current.title_id, {id: current.title_id, entryCount: 1})
            else previous.get(current.title_id).entryCount++
            return previous
        // tslint:disable-next-line:new-parens
        }, new Map).values()]
        entriesWithTitleId.map(async (item: { id: string, entryCount: number}) => {
            await this.titlesRepository.updateEntryCount(item.id, -item.entryCount)
        })
        throw new HttpException('Entries are deleted', HttpStatus.OK)
    }
}
