# language: zh-TW
# encoding: UTF-8
# Feature: 查詢球隊列表
# Epic: B - 球隊/球員資料管理
# Type: Query（無狀態變更）

@epic-b @team @query
Feature: 查詢球隊列表
  身為 使用者
  我想要 查詢球隊列表
  以便 瀏覽可管理的球隊

  Background:
    Given 系統中有以下角色:
      | 角色   | 說明                       |
      | 管理者 | 可查看所有球隊             |
      | 教練   | 只能查看自己建立的球隊     |

  # ===== 權限規則 =====

  Rule: 管理者可查詢所有球隊

    @permission @happy-path
    Example: 管理者查詢球隊列表
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 系統中有球隊「藍鷹隊」由教練A建立
      And 系統中有球隊「紅龍隊」由教練B建立
      When 使用者查詢球隊列表
      Then 操作成功
      And 回傳結果包含「藍鷹隊」
      And 回傳結果包含「紅龍隊」

  Rule: 教練只能查詢自己建立的球隊

    @permission @happy-path
    Example: 教練查詢自己建立的球隊
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者建立了球隊「藍鷹隊」
      And 系統中有球隊「紅龍隊」由其他教練建立
      When 使用者查詢球隊列表
      Then 操作成功
      And 回傳結果包含「藍鷹隊」
      And 回傳結果不包含「紅龍隊」

  # ===== 業務規則 =====

  Rule: 已刪除的球隊不出現在查詢結果中

    @happy-path
    Example: 查詢結果排除已刪除的球隊
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 系統中有球隊「藍鷹隊」
      And 球隊「已刪除隊」已被刪除
      When 使用者查詢球隊列表
      Then 操作成功
      And 回傳結果包含「藍鷹隊」
      And 回傳結果不包含「已刪除隊」

  # ===== 邊界條件 =====

  Rule: 無可查詢的球隊時回傳空列表

    @boundary
    Example: 新教練查詢球隊列表
      Given 使用者為「教練」角色
      And 使用者已登入系統
      And 使用者尚未建立任何球隊
      When 使用者查詢球隊列表
      Then 操作成功
      And 回傳結果為空列表

    @boundary
    Example: 系統無任何球隊
      Given 使用者為「管理者」角色
      And 使用者已登入系統
      And 系統中沒有任何球隊
      When 使用者查詢球隊列表
      Then 操作成功
      And 回傳結果為空列表
