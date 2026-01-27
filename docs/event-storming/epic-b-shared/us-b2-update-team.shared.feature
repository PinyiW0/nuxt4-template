# language: zh-TW
# encoding: UTF-8
# Feature: 編輯球隊
# Epic: B - 球隊/球員資料管理
# Type: Command（有狀態變更）

@epic-b @team @command
Feature: 編輯球隊
  身為 使用者
  我想要 編輯球隊名稱
  以便 確保資料正確

  Background:
    Given 系統中有以下角色:
      | 角色   | 說明                       |
      | 管理者 | 可編輯所有球隊             |
      | 教練   | 只能編輯自己建立的球隊     |

  # ===== 權限規則 =====

  Rule: 管理者可編輯所有球隊

    @permission @happy-path
    Example: 管理者編輯他人建立的球隊
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 系統中有球隊「藍鷹隊」由其他教練建立
      When 使用者編輯球隊「藍鷹隊」:
        | 球隊名稱 |
        | 銀鷹隊   |
      Then 操作成功
      And 球隊「銀鷹隊」已存在
      And 球隊「藍鷹隊」已不存在

  Rule: 教練只能編輯自己建立的球隊

    @permission @happy-path
    Example: 教練編輯自己建立的球隊
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「藍鷹隊」
      When 使用者編輯球隊「藍鷹隊」:
        | 球隊名稱 |
        | 銀鷹隊   |
      Then 操作成功
      And 球隊「銀鷹隊」已存在

    @permission @error-handling
    Example: 教練無法編輯他人建立的球隊
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 系統中有球隊「紅龍隊」由其他教練建立
      When 使用者編輯球隊「紅龍隊」:
        | 球隊名稱 |
        | 金龍隊   |
      Then 操作失敗
      And 系統顯示錯誤「無權限編輯此球隊」

  # ===== 驗證規則 =====

  Rule: 新名稱不可與其他球隊重複（不區分大小寫）

    @validation @error-handling
    Example: 編輯為已存在的球隊名稱
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「藍鷹隊」
      And 系統中有球隊「紅龍隊」
      When 使用者編輯球隊「藍鷹隊」:
        | 球隊名稱 |
        | 紅龍隊   |
      Then 操作失敗
      And 系統顯示錯誤「球隊名稱已被使用」

    @validation @error-handling
    Example: 編輯為僅大小寫不同的名稱
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「藍鷹隊」
      And 系統中有球隊「TeamB」
      When 使用者編輯球隊「藍鷹隊」:
        | 球隊名稱 |
        | teamb    |
      Then 操作失敗
      And 系統顯示錯誤「球隊名稱已被使用」

  Rule: 球隊名稱不可為空

    @validation @error-handling
    Example: 編輯球隊名稱為空
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「藍鷹隊」
      When 使用者編輯球隊「藍鷹隊」:
        | 球隊名稱 |
        |          |
      Then 操作失敗
      And 系統顯示錯誤「球隊名稱不可為空」

  # ===== 錯誤處理 =====

  Rule: 編輯不存在的球隊應失敗

    @error-handling
    Example: 編輯不存在的球隊
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 系統中沒有球隊「幽靈隊」
      When 使用者編輯球隊「幽靈隊」:
        | 球隊名稱 |
        | 新隊伍   |
      Then 操作失敗
      And 系統顯示錯誤「找不到指定的球隊」

  Rule: 編輯已刪除的球隊應失敗

    @error-handling
    Example: 編輯已刪除的球隊
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 球隊「已刪除隊」已被刪除
      When 使用者編輯球隊「已刪除隊」:
        | 球隊名稱 |
        | 復活隊   |
      Then 操作失敗
      And 系統顯示錯誤「球隊不存在或已刪除」

  # ===== 審計規則 =====

  Rule: 編輯球隊時系統應記錄修改者與修改時間

    @happy-path
    Example: 記錄球隊修改資訊
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「藍鷹隊」
      When 使用者編輯球隊「藍鷹隊」:
        | 球隊名稱 |
        | 銀鷹隊   |
      Then 操作成功
      And 球隊「銀鷹隊」的修改者為目前使用者
      And 球隊「銀鷹隊」的修改時間已記錄
