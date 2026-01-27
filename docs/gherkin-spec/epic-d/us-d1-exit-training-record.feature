# language: zh-TW
# encoding: UTF-8
# Feature: 退出訓練紀錄模式
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 已退出訓練紀錄模式
# @requires: us-d1-enter-training-record
# Allowed Roles: 管理者, 教練

@epic-d @training @command
Feature: 退出訓練紀錄模式
  身為 教練
  我想要 退出訓練紀錄頁
  以便 返回訓練列表

  Background:
    Given 使用者已登入系統

  # ===== Phase 2: 核心業務 =====

  Rule: 已進入紀錄模式後可退出

    @happy-path
    Example: 成功退出訓練紀錄模式
      Given 使用者為「教練」角色
      And 使用者已進入訓練 "訓練A" 的紀錄模式
      When 使用者 退出訓練紀錄模式
      Then 已退出訓練紀錄模式
