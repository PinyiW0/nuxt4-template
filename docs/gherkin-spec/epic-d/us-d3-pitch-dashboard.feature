# language: zh-TW
# encoding: UTF-8
# Feature: 單球儀表板
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 單球儀表板已顯示
# @requires: us-d2-query-pitch-list
# Allowed Roles: 管理者, 教練

@epic-d @pitch @query
Feature: 單球儀表板
  身為 教練
  我想要 切換九宮格落點與 3D 入壘軌跡
  以便 用不同視角理解投球

  Background:
    Given 使用者已登入系統
    And 系統中存在訓練 "訓練A"
    And 訓練 "訓練A" 有投球 "投球1"
    And 使用者已進入訓練 "訓練A" 的紀錄模式

  # ===== Phase 2: 核心業務 =====

  Rule: 可選擇單球查看九宮格落點

    @happy-path
    Example: 查看九宮格落點圖
      Given 使用者為「教練」角色
      When 使用者 選擇投球 "投球1" 查看九宮格視圖
      Then 應顯示投球 "投球1" 的九宮格落點圖
      And 應顯示投球速度
      And 應顯示投球結果

  Rule: 可選擇單球查看 3D 軌跡

    @happy-path
    Example: 查看 3D 入壘軌跡
      Given 使用者為「教練」角色
      When 使用者 選擇投球 "投球1" 查看 3D 軌跡視圖
      Then 應顯示投球 "投球1" 的 3D 入壘軌跡
      And 應顯示投球轉速

  Rule: 可在九宮格與 3D 軌跡間切換

    @happy-path
    Example: 切換視圖
      Given 使用者為「教練」角色
      And 使用者正在查看投球 "投球1" 的九宮格視圖
      When 使用者 切換到 3D 軌跡視圖
      Then 應顯示投球 "投球1" 的 3D 入壘軌跡

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法查看不存在的投球

    @error-handling
    Example: 查看不存在的投球
      Given 使用者為「教練」角色
      When 使用者 選擇投球 "不存在" 查看九宮格視圖
      Then 應回傳錯誤 "找不到指定的投球"
