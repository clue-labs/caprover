const mockPruneContainers = jest.fn()

jest.mock('dockerode', () => {
    return jest.fn().mockImplementation(() => {
        return {
            pruneContainers: mockPruneContainers,
            version: () => Promise.resolve({ ApiVersion: '1.55' }),
        }
    })
})

import DockerApi from '../src/docker/DockerApi'

describe('DockerApi.pruneContainers', () => {
    beforeEach(() => {
        mockPruneContainers.mockReset()
    })

    test('leaves stopped Swarm task containers to the Swarm task history', async () => {
        mockPruneContainers.mockResolvedValue({ ContainersDeleted: [] })

        await DockerApi.get().pruneContainers()

        expect(mockPruneContainers).toHaveBeenCalledTimes(1)
        expect(mockPruneContainers).toHaveBeenCalledWith({
            filters: { 'label!': ['com.docker.swarm.task.id'] },
        })
    })

    test('ignores a prune that is already running', async () => {
        mockPruneContainers.mockRejectedValue({ statusCode: 409 })

        await expect(DockerApi.get().pruneContainers()).resolves.toBeUndefined()

        expect(mockPruneContainers).toHaveBeenCalledTimes(1)
    })
})
