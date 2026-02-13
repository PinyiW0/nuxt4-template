映射規則需要回答一個核心問題：一個業務步驟在 UI 上怎麼操作？

  一條映射規則包含什麼

  # 一條規則的結構
  rule:
    match: "Gherkin 業務步驟 pattern"    # 從 BDD feature 匹配
    page: "/teams"                       # 發生在哪個頁面
    precondition: "已登入"               # 前置狀態
    ui_steps:                            # 展開成哪些 UI 操作
      - action: "click"
        target: "team-create"            # data-testid
      - action: "fill"
        target: "team-name"
        value: "$1"                      # 從 Gherkin 參數帶入
      - action: "click"
        target: "team-save"
    verify:                              # 操作後怎麼驗證
      - type: "toast"
        text: "球隊已建立"
      - type: "visible"
        target: "team-list"
        contains: "$1"

  具體範例

  # ---- 認證相關 ----

  - match: "使用者以帳號 {string} 密碼 {string} 登入"
    page: "/login"
    precondition: null
    ui_steps:
      - action: fill
        target: login-account
        value: $1
      - action: fill
        target: login-password
        value: $2
      - action: click
        target: login-submit
    verify:
      success:
        - type: url
          value: "/"
        - type: toast
          text: "登入成功"
      failure:
        - type: toast
          text: "$error_message"

  - match: "{role} {string} 已登入"
    page: "/login"
    precondition: null
    ui_steps:                            # 複合步驟：登入是前置動作
      - action: fill
        target: login-account
        value: $2
      - action: fill
        target: login-password
        value: "pass123"                 # 預設測試密碼
      - action: click
        target: login-submit
      - action: wait_url
        value: "/"
    verify: null                         # 前置條件，不需額外驗證

  # ---- 球隊 CRUD ----

  - match: "教練建立球隊名稱為 {string}"
    page: "/teams"
    precondition: "已登入"
    ui_steps:
      - action: click
        target: team-create
      - action: wait_visible
        target: team-form-modal
      - action: fill
        target: team-name
        value: $1
      - action: click
        target: team-save
    verify:
      success:
        - type: toast
          text: "球隊已建立"
        - type: modal_closed
          target: team-form-modal
      failure:
        - type: toast
          text: "$error_message"

  - match: "教練查詢球隊列表"
    page: "/teams"
    precondition: "已登入"
    ui_steps:
      - action: navigate
        value: "/teams"
      - action: wait_visible
        target: team-list
    verify: null                         # 查詢本身不需驗證，由 Then 驗證結果

  映射規則涵蓋的範圍
  ┌──────────────┬─────────────────────┬──────────────────────────┐
  │     區塊     │        內容         │           來源           │
  ├──────────────┼─────────────────────┼──────────────────────────┤
  │ match        │ BDD Gherkin pattern │ .feature 檔案            │
  ├──────────────┼─────────────────────┼──────────────────────────┤
  │ page         │ 操作發生的路由      │ app/pages/ 結構          │
  ├──────────────┼─────────────────────┼──────────────────────────┤
  │ precondition │ 需要什麼前置狀態    │ 業務邏輯                 │
  ├──────────────┼─────────────────────┼──────────────────────────┤
  │ ui_steps     │ 具體 UI 操作序列    │ 頁面 template + testid   │
  ├──────────────┼─────────────────────┼──────────────────────────┤
  │ verify       │ 操作後的視覺反饋    │ toast / URL / 元素可見性 │
  └──────────────┴─────────────────────┴──────────────────────────┘
  action 類型清單
  ┌──────────────┬───────────────┬─────────────────────────────────────┐
  │    action    │     說明      │           對應 Playwright           │
  ├──────────────┼───────────────┼─────────────────────────────────────┤
  │ navigate     │ 跳轉頁面      │ page.goto(url)                      │
  ├──────────────┼───────────────┼─────────────────────────────────────┤
  │ click        │ 點擊元素      │ page.getByTestId(x).click()         │
  ├──────────────┼───────────────┼─────────────────────────────────────┤
  │ fill         │ 填入文字      │ page.getByTestId(x).fill(v)         │
  ├──────────────┼───────────────┼─────────────────────────────────────┤
  │ select       │ 選擇下拉選項  │ page.getByTestId(x).selectOption(v) │
  ├──────────────┼───────────────┼─────────────────────────────────────┤
  │ wait_visible │ 等待元素出現  │ expect(locator).toBeVisible()       │
  ├──────────────┼───────────────┼─────────────────────────────────────┤
  │ wait_url     │ 等待 URL 變化 │ expect(page).toHaveURL(v)           │
  ├──────────────┼───────────────┼─────────────────────────────────────┤
  │ wait_hidden  │ 等待元素消失  │ expect(locator).not.toBeVisible()   │
  └──────────────┴───────────────┴─────────────────────────────────────┘
  verify 類型清單
  ┌──────────────┬────────────────┬──────────────────────────────────────────┐
  │     type     │      說明      │             對應 Playwright              │
  ├──────────────┼────────────────┼──────────────────────────────────────────┤
  │ toast        │ Toast 通知出現 │ expect(page.getByText(x)).toBeVisible()  │
  ├──────────────┼────────────────┼──────────────────────────────────────────┤
  │ url          │ 頁面 URL       │ expect(page).toHaveURL(x)                │
  ├──────────────┼────────────────┼──────────────────────────────────────────┤
  │ visible      │ 元素可見       │ expect(getByTestId(x)).toBeVisible()     │
  ├──────────────┼────────────────┼──────────────────────────────────────────┤
  │ contains     │ 元素包含文字   │ expect(locator).toContainText(x)         │
  ├──────────────┼────────────────┼──────────────────────────────────────────┤
  │ count        │ 列表數量       │ expect(locator).toHaveCount(n)           │
  ├──────────────┼────────────────┼──────────────────────────────────────────┤
  │ modal_closed │ Modal 關閉     │ expect(getByTestId(x)).not.toBeVisible() │
  └──────────────┴────────────────┴──────────────────────────────────────────┘
  這份映射規則怎麼產出

  掃描 app/pages/*.vue 的 testid
    +
  讀取 BDD .feature 的 Given/When/Then
    +
  人工 or AI 補上 ui_steps 對應
    ↓
  產出映射表（YAML or Markdown）
    ↓
  根據映射表自動生成 E2E step definitions

  還缺什麼才能實作？
  ┌───────────────────────┬─────────────┬───────────────────────────────────┐
  │         項目          │    狀態     │               說明                │
  ├───────────────────────┼─────────────┼───────────────────────────────────┤
  │ BDD .feature 檔案     │ ✅ 有 26 個 │ 業務步驟的來源                    │
  ├───────────────────────┼─────────────┼───────────────────────────────────┤
  │ 頁面 testid           │ ✅ 已有     │ login、teams 頁面都有             │
  ├───────────────────────┼─────────────┼───────────────────────────────────┤
  │ 頁面路由對應          │ ✅ 可推導   │ app/pages/ 結構                   │
  ├───────────────────────┼─────────────┼───────────────────────────────────┤
  │ 映射規則格式定義      │ ⬜ 待確認   │ 就是這份，你覺得 OK 嗎？          │
  ├───────────────────────┼─────────────┼───────────────────────────────────┤
  │ 各 feature 的映射內容 │ ⬜ 待產出   │ 26 個 feature 各自的規則          │
  ├───────────────────────┼─────────────┼───────────────────────────────────┤
  │ E2E step 生成邏輯     │ ⬜ 待實作   │ 讀取映射 → 產出 Playwright 程式碼 │
  └───────────────────────┴─────────────┴───────────────────────────────────┘
