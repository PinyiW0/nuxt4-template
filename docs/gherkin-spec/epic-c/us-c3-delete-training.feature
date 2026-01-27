# language: zh-TW
# encoding: UTF-8
# Feature: 刪除訓練
# Epic: C - 訓練建立與 AI 系統控制
# User Story: US-C3
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 訓練已刪除, 投球紀錄已級聯刪除
# @requires: us-c1-query-training
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-008: 軟刪除
#   - GD-010: 刪除訓練時級聯刪除投球紀錄
#   - GD-011: 教練只能操作自己的資源

@epic-c @training @command
Feature: 刪除訓練
  身為 教練
  我想要 刪除錯誤或不需要的訓練
  以便 避免污染資料

  Background:
    Given 使用者已登入系統
    And 系統中存在訓練 "訓練A"

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可刪除所有訓練

    @permission @happy-path
    Example: 管理者刪除任意訓練
      Given 使用者為「管理者」角色
      And 訓練 "訓練A" 的建立者為 "coach1"
      When 使用者 刪除訓練 "訓練A"
      Then 訓練 "訓練A" 狀態應為 "DELETED"
      And 訓練 "訓練A" 的刪除時間已記錄

  Rule: 教練只能刪除自己建立的訓練

    @permission @happy-path
    Example: 教練刪除自己建立的訓練
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 訓練 "訓練A" 的建立者為 "coach1"
      When 使用者 刪除訓練 "訓練A"
      Then 訓練 "訓練A" 狀態應為 "DELETED"

    @permission @error-handling
    Example: 教練無法刪除他人建立的訓練
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 訓練 "訓練A" 的建立者為 "coach2"
      When 使用者 刪除訓練 "訓練A"
      Then 應回傳錯誤 "無權限執行此操作"

  # ===== Phase 2: 核心業務 =====

  Rule: 刪除訓練採用軟刪除

    @happy-path
    Example: 軟刪除訓練保留歷史紀錄
      Given 使用者為「管理者」角色
      And 訓練 "訓練A" 狀態為 "ACTIVE"
      When 使用者 刪除訓練 "訓練A"
      Then 訓練 "訓練A" 狀態應為 "DELETED"
      And 訓練 "訓練A" 的刪除時間已記錄
      And 訓練 "訓練A" 的資料仍保留在資料庫

  Rule: 刪除訓練時級聯刪除投球紀錄

    @happy-path
    Example: 刪除訓練時一併刪除投球紀錄
      Given 使用者為「管理者」角色
      And 訓練 "訓練A" 有以下投球紀錄:
        | 投球序號 | 球速 | 是否好球 |
        | 1        | 120  | 是       |
        | 2        | 118  | 否       |
        | 3        | 122  | 是       |
      When 使用者 刪除訓練 "訓練A"
      Then 訓練 "訓練A" 狀態應為 "DELETED"
      And 訓練 "訓練A" 的所有投球紀錄狀態應為 "DELETED"

    @happy-path
    Example: 刪除無投球紀錄的訓練
      Given 使用者為「管理者」角色
      And 訓練 "訓練A" 沒有任何投球紀錄
      When 使用者 刪除訓練 "訓練A"
      Then 訓練 "訓練A" 狀態應為 "DELETED"

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法刪除不存在的訓練

    @error-handling
    Example: 刪除不存在的訓練
      Given 使用者為「管理者」角色
      And 系統中不存在訓練 "幽靈訓練"
      When 使用者 刪除訓練 "幽靈訓練"
      Then 應回傳錯誤 "找不到指定的訓練"

  Rule: 無法刪除已刪除的訓練

    @error-handling
    Example: 重複刪除訓練應失敗
      Given 使用者為「管理者」角色
      And 訓練 "訓練A" 狀態為 "DELETED"
      When 使用者 刪除訓練 "訓練A"
      Then 應回傳錯誤 "訓練不存在或已刪除"
