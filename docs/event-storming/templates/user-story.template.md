# User Story Template

## Basic Information
- **Story ID**: {US-ID}
- **Epic**: {Epic Name}
- **Priority**: {High/Medium/Low}
- **Story Points**: {Points}

## User Story
**身為** {角色}
**我想要** {功能需求}
**以便** {業務價值}

## Acceptance Criteria
- [ ] {驗收條件 1}
- [ ] {驗收條件 2}
- [ ] {驗收條件 3}

## Additional Context
{補充說明、限制條件、相依性等}

## Example

### Basic Information
- **Story ID**: US-B1
- **Epic**: 球隊/球員資料管理
- **Priority**: High
- **Story Points**: 5

### User Story
**身為** 管理者/教練
**我想要** 查詢並選擇球隊
**以便** 管理該隊球員

### Acceptance Criteria
- [ ] 用戶可以查詢球隊列表
- [ ] 用戶可以套用篩選條件（狀態、名稱關鍵字）
- [ ] 用戶可以選擇特定球隊
- [ ] 選擇球隊後，系統建立該球隊的操作上下文
- [ ] 顯示適當的載入和錯誤狀態

### Additional Context
- 需要權限驗證
- 支援分頁（每頁 10-100 筆）
- 選擇球隊後自動載入該隊球員列表
