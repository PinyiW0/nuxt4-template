# language: zh-TW
# encoding: UTF-8
# Feature: 調整好球帶
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 好球帶已更新
# @requires: us-d1-enter-training-record
# Allowed Roles: 管理者, 教練

@epic-d @strike-zone @command
Feature: 調整好球帶
  身為 教練
  我想要 手動調整好球帶範圍參數
  以便 校正九宮格判定與顯示

  Background:
    Given 使用者已登入系統
    And 系統中存在訓練 "訓練A"
    And 使用者已進入訓練 "訓練A" 的紀錄模式

  # ===== Phase 2: 核心業務 =====

  Rule: 可調整好球帶的上緣與下緣高度

    @happy-path
    Example: 調整好球帶範圍
      Given 使用者為「教練」角色
      When 使用者 調整訓練 "訓練A" 的好球帶，上緣 120，下緣 60
      Then 好球帶上緣應為 120
      And 好球帶下緣應為 60

  Rule: 調整後九宮格顯示應即時更新

    @happy-path
    Example: 好球帶調整後即時反映
      Given 使用者為「教練」角色
      And 使用者正在查看九宮格視圖
      When 使用者 調整訓練 "訓練A" 的好球帶，上緣 120，下緣 60
      Then 九宮格顯示應依新參數校正

  # ===== Phase 3: 邊界條件 =====

  Rule: 上緣必須大於下緣

    @error-handling
    Example: 上緣小於下緣應失敗
      Given 使用者為「教練」角色
      When 使用者 調整訓練 "訓練A" 的好球帶，上緣 50，下緣 100
      Then 應回傳錯誤 "上緣必須大於下緣"

  Rule: 高度必須為正數

    @boundary @error-handling
    Example: 負數高度應失敗
      Given 使用者為「教練」角色
      When 使用者 調整訓練 "訓練A" 的好球帶，上緣 -10，下緣 60
      Then 應回傳錯誤 "高度必須為正數"
