# language: zh-TW
# encoding: UTF-8
# Feature: 查詢球員列表
# Epic: B - 球隊/球員資料管理
# Type: Query（無狀態變更）

@epic-b @player @query
Feature: 查詢球員列表
  身為 使用者
  我想要 查詢球隊的球員列表
  以便 管理球員名單

  Background:
    Given 系統中有以下角色:
      | 角色   | 說明                           |
      | 管理者 | 可查詢所有球隊的球員           |
      | 教練   | 只能查詢自己建立的球隊的球員   |

  # ===== 權限規則 =====

  Rule: 管理者可查詢任何球隊的球員

    @permission @happy-path
    Example: 管理者查詢他人球隊的球員
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 系統中有球隊「藍鷹隊」由其他教練建立
      And 球隊「藍鷹隊」有球員:
        | 姓名   | 背號 | 守備位置 |
        | 王小明 | 1    | P        |
        | 李小華 | 2    | C        |
      When 使用者查詢球隊「藍鷹隊」的球員列表
      Then 操作成功
      And 回傳結果包含「王小明」
      And 回傳結果包含「李小華」

  Rule: 教練只能查詢自己建立的球隊的球員

    @permission @happy-path
    Example: 教練查詢自己球隊的球員
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「藍鷹隊」
      And 球隊「藍鷹隊」有球員:
        | 姓名   | 背號 |
        | 王小明 | 1    |
      When 使用者查詢球隊「藍鷹隊」的球員列表
      Then 操作成功
      And 回傳結果包含「王小明」

    @permission @error-handling
    Example: 教練無法查詢他人球隊的球員
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 系統中有球隊「紅龍隊」由其他教練建立
      When 使用者查詢球隊「紅龍隊」的球員列表
      Then 操作失敗
      And 系統顯示錯誤「無權限查詢此球隊」

  # ===== 業務規則 =====

  Rule: 球員應依排序順序顯示

    @happy-path
    Example: 球員依排序順序顯示
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「藍鷹隊」
      And 球隊「藍鷹隊」有球員:
        | 姓名   | 背號 | 順序 |
        | 王小明 | 1    | 2    |
        | 李小華 | 2    | 1    |
      When 使用者查詢球隊「藍鷹隊」的球員列表
      Then 操作成功
      And 第 1 筆球員應為「李小華」
      And 第 2 筆球員應為「王小明」

  Rule: 已刪除的球員不出現在查詢結果中

    @happy-path
    Example: 查詢結果排除已刪除的球員
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「藍鷹隊」
      And 球隊「藍鷹隊」有球員:
        | 姓名   | 背號 |
        | 王小明 | 1    |
      And 球員「李小華」已被刪除
      When 使用者查詢球隊「藍鷹隊」的球員列表
      Then 操作成功
      And 回傳結果包含「王小明」
      And 回傳結果不包含「李小華」

  # ===== 邊界條件 =====

  Rule: 球隊無球員時回傳空列表

    @boundary
    Example: 查詢無球員的球隊
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「空白隊」
      And 球隊「空白隊」沒有任何球員
      When 使用者查詢球隊「空白隊」的球員列表
      Then 操作成功
      And 回傳結果為空列表

  # ===== 錯誤處理 =====

  Rule: 查詢不存在的球隊應失敗

    @error-handling
    Example: 查詢不存在球隊的球員
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 系統中沒有球隊「幽靈隊」
      When 使用者查詢球隊「幽靈隊」的球員列表
      Then 操作失敗
      And 系統顯示錯誤「找不到指定的球隊」

  Rule: 查詢已刪除的球隊應失敗

    @error-handling
    Example: 查詢已刪除球隊的球員
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 球隊「已刪除隊」已被刪除
      When 使用者查詢球隊「已刪除隊」的球員列表
      Then 操作失敗
      And 系統顯示錯誤「球隊不存在或已刪除」
