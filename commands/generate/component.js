module.exports = {
  description: 'Generates a component, styles, and an optional test.',
  run: async function(toolbox) {
    // grab some features
    const { parameters, strings, print, ignite } = toolbox
    const { pascalCase, isBlank } = strings
    const config = ignite.loadIgniteConfig()
    const { tests } = config

    const options = parameters.options || {}

    const hasFolder = !isBlank(options.folder)

    // validation
    if (isBlank(parameters.first) && !hasFolder) {
      print.info(`${toolbox.runtime.brand} generate component <name>\n`)
      print.info('A name is required.')
      return
    }

    let componentPath = hasFolder
      ? `${options.folder}/${parameters.first || 'index'}`
      : parameters.first

    let pathComponents = componentPath.split('/').map(pascalCase)
    let name = pathComponents.pop()
    if (name === 'Index') {
      name = 'index'
    }
    const relativePath = pathComponents.length ? pathComponents.join('/') + '/' : ''

    const props = { name }
    const jobs = [
      {
        template: 'component.ejs',
        target: `App/Components/${name}/${name}.js`
      },
      {
        template: 'component-style.ejs',
        target: `App/Components/${name}/${name}Style.js`
      },
      {
        template: 'component-index.ejs',
        target: `App/Components/${name}/index.js`
      },
      tests === 'ava' && {
        template: 'component-test.ejs',
        target: `Test/Components/${name}/${name}Test.js`
      }
    ]

    await ignite.copyBatch(toolbox, jobs, props)
  }
}
