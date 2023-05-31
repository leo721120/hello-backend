export default require(`${__dirname}/addon.node`) as {
    hello(name: string): string
}