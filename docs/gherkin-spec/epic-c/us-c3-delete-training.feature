# language: zh-TW
# encoding: UTF-8
# Feature: 刪除訓練
# Epic: C - 訓練建立與 AI 系統控制
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23
# Boundary Decisions:
#   - GD-004: 硬刪除（含投球資料）

@epic-c @training @command
Feature: 刪除訓練
  身為 教練
  我想要 刪除錯誤或不需要的訓練
  以便 避免污染資料

  Background:
    Given 教練 已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1

  Rule: 刪除訓練會連帶刪除所有投球資料

    @happy-path
    Example: 成功刪除訓練及投球資料
      Given 球隊 "閃電隊" 有訓練紀錄，日期 "2026-01-20"，受測球員 "王小明"
      And 該訓練有 10 筆投球資料
      When 教練 刪除該訓練
      Then 訓練應該不存在
      And 該訓練的投球資料應該全部刪除

    @happy-path
    Example: 刪除無投球資料的訓練
      Given 球隊 "閃電隊" 有訓練紀錄，日期 "2026-01-20"，受測球員 "王小明"
      And 該訓練沒有任何投球資料
      When 教練 刪除該訓練
      Then 訓練應該不存在

  Rule: 刪除不存在的訓練應失敗

    @error-handling
    Example: 刪除不存在的訓練應失敗
      Given 系統中沒有該訓練
      When 教練 刪除該訓練
      Then 應回傳錯誤 "找不到指定的訓練"
