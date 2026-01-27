# language: zh-TW
# encoding: UTF-8
# Feature: 刪除球員
# Epic: B - 球隊/球員資料管理
# Type: Command（有狀態變更）

@epic-b @player @command
Feature: 刪除球員
  身為 使用者
  我想要 刪除球員
  以便 清理不需要的資料

  Background:
    Given 系統中有以下角色:
      | 角色   | 說明                           |
      | 管理者 | 可刪除任何球隊的球員           |
      | 教練   | 只能刪除自己建立的球隊的球員   |

  # ===== 權限規則 =====

  Rule: 管理者可刪除任何球隊的球員

    @permission @happy-path
    Example: 管理者刪除他人球隊的球員
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 系統中有球隊「藍鷹隊」由其他教練建立
      And 球隊「藍鷹隊」有球員:
        | 姓名   | 背號 |
        | 王小明 | 1    |
      When 使用者刪除球員「王小明」
      Then 操作成功
      And 球員「王小明」已被刪除

  Rule: 教練只能刪除自己建立的球隊的球員

    @permission @happy-path
    Example: 教練刪除自己球隊的球員
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「藍鷹隊」
      And 球隊「藍鷹隊」有球員:
        | 姓名   | 背號 |
        | 王小明 | 1    |
      When 使用者刪除球員「王小明」
      Then 操作成功
      And 球員「王小明」已被刪除

    @permission @error-handling
    Example: 教練無法刪除他人球隊的球員
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 系統中有球隊「紅龍隊」由其他教練建立
      And 球隊「紅龍隊」有球員:
        | 姓名   | 背號 |
        | 陳志明 | 5    |
      When 使用者刪除球員「陳志明」
      Then 操作失敗
      And 系統顯示錯誤「無權限刪除此球員」

  # ===== 業務規則 =====

  Rule: 刪除球員不影響其他球員

    @happy-path
    Example: 刪除球員後其他球員不受影響
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「藍鷹隊」
      And 球隊「藍鷹隊」有球員:
        | 姓名   | 背號 |
        | 王小明 | 1    |
        | 李小華 | 2    |
      When 使用者刪除球員「王小明」
      Then 操作成功
      And 球員「王小明」已被刪除
      And 球員「李小華」仍存在

  Rule: 刪除採用軟刪除機制，資料仍保留於系統中

    @happy-path
    Example: 軟刪除保留球員資料
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 系統中有球隊「藍鷹隊」
      And 球隊「藍鷹隊」有球員:
        | 姓名   | 背號 |
        | 王小明 | 1    |
      When 使用者刪除球員「王小明」
      Then 操作成功
      And 球員「王小明」已被刪除
      And 球員「王小明」的資料仍保留於系統中

  # ===== 錯誤處理 =====

  Rule: 刪除不存在的球員應失敗

    @error-handling
    Example: 刪除不存在的球員
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 系統中有球隊「藍鷹隊」
      And 球隊「藍鷹隊」沒有球員「幽靈球員」
      When 使用者刪除球員「幽靈球員」
      Then 操作失敗
      And 系統顯示錯誤「找不到指定的球員」

  Rule: 不可重複刪除已刪除的球員

    @error-handling
    Example: 重複刪除已刪除的球員
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 球員「已刪除球員」已被刪除
      When 使用者刪除球員「已刪除球員」
      Then 操作失敗
      And 系統顯示錯誤「球員不存在或已刪除」

  # ===== 審計規則 =====

  Rule: 刪除球員時系統應記錄刪除者與刪除時間

    @happy-path
    Example: 記錄球員刪除資訊
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「藍鷹隊」
      And 球隊「藍鷹隊」有球員:
        | 姓名   | 背號 |
        | 王小明 | 1    |
      When 使用者刪除球員「王小明」
      Then 操作成功
      And 球員「王小明」的刪除者為目前使用者
      And 球員「王小明」的刪除時間已記錄
