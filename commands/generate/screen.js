const patterns = require('../../lib/patterns')

module.exports = {
  description: 'Generates an opinionated container.',
  run: async function(toolbox) {
    // grab some features
    const { parameters, print, strings, ignite, filesystem } = toolbox
    const { pascalCase, isBlank } = strings
    const config = ignite.loadIgniteConfig()

    // validation
    if (isBlank(parameters.first)) {
      print.info(`${toolbox.runtime.brand} generate screen <name>\n`)
      print.info('A name is required.')
      return
    }

    const name = pascalCase(parameters.first)
    const screenName = name.endsWith('Screen') ? name : `${name}Screen`
    const props = { name: screenName }

    const jobs = [
      {
        template: `screen.ejs`,
        target: `App/Containers/${screenName}/${screenName}.js`
      },
      {
        template: `screen-style.ejs`,
        target: `App/Containers/${screenName}/${screenName}Style.js`
      },
      {
        template: `component-index.ejs`,
        target: `App/Containers/${screenName}/index.js`
      }
    ]

    // make the templates
    await ignite.copyBatch(toolbox, jobs, props)

    // if using `react-navigation` go the extra step
    // and insert the screen into the nav router
    if (config.navigation === 'react-navigation') {
      const appNavFilePath = `${process.cwd()}/App/Navigation/AppNavigation.js`
      const importToAdd = `import ${screenName} from '../Containers/${screenName}';`
      const routeToAdd = `    ${screenName}: { screen: ${screenName} },`

      if (!filesystem.exists(appNavFilePath)) {
        const msg = `No '${appNavFilePath}' file found.  Can't insert screen.`
        print.error(msg)
        process.exit(1)
      }

      // insert screen import
      ignite.patchInFile(appNavFilePath, {
        after: patterns[patterns.constants.PATTERN_IMPORTS],
        insert: importToAdd
      })

      // insert screen route
      ignite.patchInFile(appNavFilePath, {
        after: patterns[patterns.constants.PATTERN_ROUTES],
        insert: routeToAdd
      })
    } else {
      print.info(`Screen ${screenName} created, manually add it to your navigation`)
    }
  }
}
