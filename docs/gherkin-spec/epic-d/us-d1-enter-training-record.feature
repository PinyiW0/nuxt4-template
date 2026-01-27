# language: zh-TW
# encoding: UTF-8
# Feature: 進入訓練紀錄模式
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 已進入訓練紀錄模式
# @requires: us-c1-query-training
# Allowed Roles: 管理者, 教練

@epic-d @training @command
Feature: 進入訓練紀錄模式
  身為 教練
  我想要 進入某筆訓練的紀錄頁
  以便 檢視該訓練的投球清單與詳細數據

  Background:
    Given 使用者已登入系統
    And 系統中存在訓練 "訓練A"

  # ===== Phase 2: 核心業務 =====

  Rule: 可進入訓練紀錄模式查看投球

    @happy-path
    Example: 成功進入訓練紀錄模式
      Given 使用者為「教練」角色
      When 使用者 進入訓練 "訓練A" 的紀錄模式
      Then 已進入訓練紀錄模式
      And 可查看投球清單

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法進入不存在的訓練

    @error-handling
    Example: 進入不存在的訓練
      Given 使用者為「教練」角色
      And 系統中不存在訓練 "幽靈訓練"
      When 使用者 進入訓練 "幽靈訓練" 的紀錄模式
      Then 應回傳錯誤 "找不到指定的訓練"

  Rule: 無法進入已刪除的訓練

    @error-handling
    Example: 進入已刪除的訓練
      Given 使用者為「教練」角色
      And 訓練 "訓練A" 狀態為 "DELETED"
      When 使用者 進入訓練 "訓練A" 的紀錄模式
      Then 應回傳錯誤 "訓練不存在或已刪除"
