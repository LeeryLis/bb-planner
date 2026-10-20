export class BuildNotFoundError extends Error {
    constructor(public readonly name: string) {
        super(`Build not found: ${name}`);
        this.name = "BuildNotFoundError";
    }
}

export class BuildAlreadyExistsError extends Error {
    constructor(public readonly name: string) {
        super(`Build already exists: ${name}`);
        this.name = "BuildAlreadyExistsError";
    }
}