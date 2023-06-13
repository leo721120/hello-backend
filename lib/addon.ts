export default require(`${__dirname}/addon.node`) as {
    hello(name: string): string
    /**
    current working directory by c++ boost.filesystem

    @returns `unknown` if boost is not supported
    */
    cwd(): string
}