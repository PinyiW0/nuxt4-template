const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')

// 驗證輸出檔案的工具

class OutputValidator {
  constructor(userStoryId) {
    this.userStoryId = userStoryId
    this.examplesDir = path.join(__dirname, '..', 'examples', userStoryId)
    this.errors = []
    this.warnings = []
  }

  // 驗證 JSON 檔案格式
  validateJSON(filePath, requiredFields) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const data = JSON.parse(content)

      // 檢查必要欄位
      for (const field of requiredFields) {
        if (!(field in data)) {
          this.errors.push(`${filePath}: 缺少必要欄位 '${field}'`)
        }
      }

      return data
    }
    catch (error) {
      this.errors.push(`${filePath}: JSON 格式錯誤 - ${error.message}`)
      return null
    }
  }

  // Stage 1: Domain Events 驗證
  validateDomainEvents() {
    console.log('驗證 Stage 1: Domain Events...')
    const filePath = path.join(this.examplesDir, '01-domain-events.json')

    if (!fs.existsSync(filePath)) {
      this.errors.push('找不到 01-domain-events.json')
      return
    }

    const data = this.validateJSON(filePath, ['userStoryId', 'domainEvents'])
    if (!data)
      return

    // 驗證每個 event
    if (!Array.isArray(data.domainEvents) || data.domainEvents.length === 0) {
      this.errors.push('domainEvents 必須是非空陣列')
      return
    }

    data.domainEvents.forEach((event, index) => {
      const requiredFields = ['eventName', 'description', 'sequence', 'source', 'eventType']
      requiredFields.forEach((field) => {
        if (!(field in event)) {
          this.errors.push(`Event ${index}: 缺少欄位 '${field}'`)
        }
      })

      // 檢查命名規範（過去式）
      if (event.eventName && !this.isPastTense(event.eventName)) {
        this.warnings.push(`Event '${event.eventName}' 應使用過去式命名`)
      }

      // 檢查 eventType
      if (event.eventType && !['Command', 'Query'].includes(event.eventType)) {
        this.errors.push(`Event '${event.eventName}': eventType 必須是 'Command' 或 'Query'`)
      }

      // 檢查 source
      if (event.source && !['Actor', 'System'].includes(event.source)) {
        this.errors.push(`Event '${event.eventName}': source 必須是 'Actor' 或 'System'`)
      }
    })
  }

  // Stage 2: Commands 驗證
  validateCommands() {
    console.log('驗證 Stage 2: Commands...')
    const filePath = path.join(this.examplesDir, '02-commands.json')

    if (!fs.existsSync(filePath)) {
      this.errors.push('找不到 02-commands.json')
      return
    }

    const data = this.validateJSON(filePath, ['userStoryId', 'commands', 'commandEventMapping'])
    if (!data)
      return

    // 驗證每個 command
    if (!Array.isArray(data.commands) || data.commands.length === 0) {
      this.errors.push('commands 必須是非空陣列')
      return
    }

    data.commands.forEach((command, index) => {
      const requiredFields = ['commandName', 'description', 'operationType', 'actor', 'input', 'output']
      requiredFields.forEach((field) => {
        if (!(field in command)) {
          this.errors.push(`Command ${index}: 缺少欄位 '${field}'`)
        }
      })

      // 檢查命名規範（動詞開頭）
      if (command.commandName && !this.isVerb(command.commandName)) {
        this.warnings.push(`Command '${command.commandName}' 應使用動詞開頭`)
      }

      // 檢查 operationType
      if (command.operationType && !['Command', 'Query'].includes(command.operationType)) {
        this.errors.push(`Command '${command.commandName}': operationType 必須是 'Command' 或 'Query'`)
      }
    })
  }

  // Stage 3: Aggregates 驗證
  validateAggregates() {
    console.log('驗證 Stage 3: Aggregates...')
    const filePath = path.join(this.examplesDir, '03-aggregates.json')

    if (!fs.existsSync(filePath)) {
      this.errors.push('找不到 03-aggregates.json')
      return
    }

    const data = this.validateJSON(filePath, ['userStoryId', 'aggregates'])
    if (!data)
      return

    if (!Array.isArray(data.aggregates) || data.aggregates.length === 0) {
      this.errors.push('aggregates 必須是非空陣列')
      return
    }

    data.aggregates.forEach((aggregate, index) => {
      const requiredFields = ['aggregateName', 'description', 'aggregateRoot', 'handlesCommands', 'emitsEvents']
      requiredFields.forEach((field) => {
        if (!(field in aggregate)) {
          this.errors.push(`Aggregate ${index}: 缺少欄位 '${field}'`)
        }
      })

      // 檢查 aggregateRoot 有 id 屬性
      if (aggregate.aggregateRoot && aggregate.aggregateRoot.properties) {
        const hasId = aggregate.aggregateRoot.properties.some(prop => prop.name === 'id')
        if (!hasId) {
          this.warnings.push(`Aggregate '${aggregate.aggregateName}': aggregateRoot 應該有 'id' 屬性`)
        }
      }
    })
  }

  // Stage 4: Policies 驗證
  validatePolicies() {
    console.log('驗證 Stage 4: Policies...')
    const filePath = path.join(this.examplesDir, '04-policies.json')

    if (!fs.existsSync(filePath)) {
      this.errors.push('找不到 04-policies.json')
      return
    }

    const data = this.validateJSON(filePath, ['userStoryId', 'commandRules'])
    if (!data)
      return

    // 驗證 commandRules
    if (data.commandRules) {
      data.commandRules.forEach((rule, index) => {
        if (!rule.preconditions || rule.preconditions.length === 0) {
          this.warnings.push(`CommandRule ${index} (${rule.commandName}): 缺少 preconditions`)
        }
        if (!rule.postconditions || rule.postconditions.length === 0) {
          this.warnings.push(`CommandRule ${index} (${rule.commandName}): 缺少 postconditions`)
        }
      })
    }
  }

  // Stage 5: Read Models 驗證
  validateReadModels() {
    console.log('驗證 Stage 5: Read Models...')
    const filePath = path.join(this.examplesDir, '05-read-models.json')

    if (!fs.existsSync(filePath)) {
      this.errors.push('找不到 05-read-models.json')
      return
    }

    const data = this.validateJSON(filePath, ['userStoryId', 'readModels', 'uiViews'])
    if (!data)
      return

    if (data.readModels && data.readModels.length === 0) {
      this.warnings.push('readModels 陣列為空')
    }

    if (data.uiViews && data.uiViews.length === 0) {
      this.warnings.push('uiViews 陣列為空')
    }
  }

  // Stage 6: Gherkin 驗證
  validateGherkin() {
    console.log('驗證 Stage 6: Gherkin...')
    const filePath = path.join(this.examplesDir, '06-scenarios.feature')

    if (!fs.existsSync(filePath)) {
      this.errors.push('找不到 06-scenarios.feature')
      return
    }

    const content = fs.readFileSync(filePath, 'utf-8')

    // 檢查基本結構
    if (!content.includes('Feature:')) {
      this.errors.push('Gherkin 檔案缺少 Feature 定義')
    }

    if (!content.includes('Scenario:') && !content.includes('Scenario Outline:')) {
      this.errors.push('Gherkin 檔案缺少 Scenario')
    }

    // 檢查 Given-When-Then 結構
    const hasGiven = content.includes('Given')
    const hasWhen = content.includes('When')
    const hasThen = content.includes('Then')

    if (!hasGiven || !hasWhen || !hasThen) {
      this.warnings.push('Gherkin 檔案可能缺少完整的 Given-When-Then 結構')
    }

    // 檢查 Tags
    const hasTags = content.includes('@')
    if (!hasTags) {
      this.warnings.push('Gherkin 檔案建議加入 Tags（@happy-path, @validation 等）')
    }
  }

  // 輔助函式：檢查是否為過去式（簡單判斷）
  isPastTense(word) {
    return word.endsWith('ed') || word.endsWith('Created') || word.endsWith('Updated')
      || word.endsWith('Deleted') || word.endsWith('Retrieved') || word.endsWith('Selected')
  }

  // 輔助函式：檢查是否為動詞開頭（簡單判斷）
  isVerb(word) {
    const verbs = ['Create', 'Update', 'Delete', 'Query', 'Select', 'Add', 'Remove', 'Get', 'Set', 'Load']
    return verbs.some(verb => word.startsWith(verb))
  }

  // 執行所有驗證
  validateAll() {
    console.log(`\n開始驗證 User Story: ${this.userStoryId}\n`)
    console.log('='.repeat(50))

    this.validateDomainEvents()
    this.validateCommands()
    this.validateAggregates()
    this.validatePolicies()
    this.validateReadModels()
    this.validateGherkin()

    console.log('='.repeat(50))
    console.log('\n驗證結果：')
    console.log('='.repeat(50))

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✓ 所有檔案驗證通過！')
      return true
    }

    if (this.errors.length > 0) {
      console.log('\n錯誤：')
      this.errors.forEach(error => console.log(`  ✗ ${error}`))
    }

    if (this.warnings.length > 0) {
      console.log('\n警告：')
      this.warnings.forEach(warning => console.log(`  ⚠ ${warning}`))
    }

    console.log('='.repeat(50))

    return this.errors.length === 0
  }
}

// 主程式
const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('使用方式: node validate-output.js <USER_STORY_ID>')
  console.error('範例: node validate-output.js US-B1')
  process.exit(1)
}

const userStoryId = args[0]
const validator = new OutputValidator(userStoryId)
const success = validator.validateAll()

process.exit(success ? 0 : 1)
