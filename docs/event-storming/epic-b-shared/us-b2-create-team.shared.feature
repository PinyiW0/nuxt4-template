# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
# Type: Command（有狀態變更）

@epic-b @team @command
Feature: 建立球隊
  身為 使用者
  我想要 建立新球隊
  以便 管理球員名單

  Background:
    Given 系統中有以下角色:
      | 角色   | 說明                   |
      | 管理者 | 可建立球隊             |
      | 教練   | 可建立球隊             |

  # ===== 權限規則 =====

  Rule: 管理者與教練皆可建立球隊

    @permission @happy-path
    Example: 管理者建立球隊
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      When 使用者建立球隊:
        | 球隊名稱 |
        | 藍鷹隊   |
      Then 操作成功
      And 球隊「藍鷹隊」已建立
      And 球隊「藍鷹隊」的建立者為目前使用者

    @permission @happy-path
    Example: 教練建立球隊
      Given 使用者為「教練」角色
      And 使用者已登入系統
      When 使用者建立球隊:
        | 球隊名稱 |
        | 紅龍隊   |
      Then 操作成功
      And 球隊「紅龍隊」已建立
      And 球隊「紅龍隊」的建立者為目前使用者

  # ===== 驗證規則 =====

  Rule: 球隊名稱不可為空

    @validation @error-handling
    Example: 球隊名稱為空
      Given 使用者為「教練」角色
      And 使用者已登入系統
      When 使用者建立球隊:
        | 球隊名稱 |
        |          |
      Then 操作失敗
      And 系統顯示錯誤「球隊名稱不可為空」

  Rule: 球隊名稱不可與現有球隊重複（不區分大小寫）

    @validation @error-handling
    Example: 建立重複名稱的球隊
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 系統中有球隊「藍鷹隊」
      When 使用者建立球隊:
        | 球隊名稱 |
        | 藍鷹隊   |
      Then 操作失敗
      And 系統顯示錯誤「球隊名稱已被使用」

    @validation @error-handling
    Example: 建立僅大小寫不同的球隊名稱
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 系統中有球隊「TeamA」
      When 使用者建立球隊:
        | 球隊名稱 |
        | teama    |
      Then 操作失敗
      And 系統顯示錯誤「球隊名稱已被使用」

  # ===== 審計規則 =====

  Rule: 建立球隊時系統應記錄建立者與建立時間

    @happy-path
    Example: 記錄球隊建立資訊
      Given 使用者為「教練」角色
      And 使用者已登入系統
      When 使用者建立球隊:
        | 球隊名稱 |
        | 新球隊   |
      Then 操作成功
      And 球隊「新球隊」的建立者為目前使用者
      And 球隊「新球隊」的建立時間已記錄
