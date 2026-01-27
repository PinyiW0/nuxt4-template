# language: zh-TW
# encoding: UTF-8
# Feature: 查詢投球清單
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 投球清單已查詢
# @requires: us-d1-enter-training-record
# Allowed Roles: 管理者, 教練

@epic-d @pitch @query
Feature: 查詢投球清單
  身為 教練
  我想要 看到該訓練下的投球清單並即時更新
  以便 及時查看最新投球數據

  Background:
    Given 使用者已登入系統
    And 系統中存在訓練 "訓練A"
    And 使用者已進入訓練 "訓練A" 的紀錄模式

  # ===== Phase 2: 核心業務 =====

  Rule: 可查詢訓練的投球清單

    @happy-path
    Example: 查詢投球清單
      Given 使用者為「教練」角色
      And 訓練 "訓練A" 有以下投球:
        | 球序 | 球速    | 結果 |
        | 1    | 120 km/h | 好球 |
        | 2    | 118 km/h | 壞球 |
      When 使用者 查詢訓練 "訓練A" 的投球清單
      Then 應回傳 2 筆投球

  Rule: 投球清單支援即時更新

    @happy-path
    Example: 新投球即時顯示
      Given 使用者為「教練」角色
      And 訓練 "訓練A" 有 2 筆投球
      When AI 系統偵測到新投球
      Then 投球清單應自動更新
      And 訓練 "訓練A" 應有 3 筆投球

  # ===== Phase 3: 邊界條件 =====

  Rule: 無投球時應顯示空列表

    @boundary
    Example: 訓練沒有投球記錄
      Given 使用者為「教練」角色
      And 訓練 "訓練A" 沒有任何投球
      When 使用者 查詢訓練 "訓練A" 的投球清單
      Then 應回傳 0 筆投球
