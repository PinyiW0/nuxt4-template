# language: zh-TW
# encoding: UTF-8
# Feature: 好球帶範圍設定
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-d @strike-zone @command
Feature: 好球帶範圍設定
  身為 教練
  我想要 手動調整好球帶範圍參數
  以便 校正九宮格判定與顯示

  Background:
    Given 教練 已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1，身高 175
    And 球隊 "閃電隊" 有訓練紀錄，日期 "2026-01-20"，受測球員 "王小明"
    And 教練 已進入訓練 "2026-01-20" 的紀錄頁

  Rule: 可以調整好球帶上下邊界

    @happy-path
    Example: 成功調整好球帶上緣
      Given 好球帶上緣目前為 120
      When 教練 調整好球帶上緣為 125
      Then 好球帶上緣應為 125
      And 九宮格顯示應即時更新

    @happy-path
    Example: 成功調整好球帶下緣
      Given 好球帶下緣目前為 50
      When 教練 調整好球帶下緣為 55
      Then 好球帶下緣應為 55
      And 九宮格顯示應即時更新

    @happy-path
    Example: 同時調整上下邊界
      When 教練 調整好球帶，上緣 130，下緣 45
      Then 好球帶上緣應為 130
      And 好球帶下緣應為 45

  Rule: 調整後好壞球判定應即時更新

    @happy-path
    Example: 調整後原好球變壞球
      Given 該訓練有投球資料，落點 Y=115
      And 好球帶上緣目前為 120
      And 該投球目前判定為好球
      When 教練 調整好球帶上緣為 110
      Then 該投球應重新判定為壞球
      And 九宮格落點圖應更新標示

    @happy-path
    Example: 調整後原壞球變好球
      Given 該訓練有投球資料，落點 Y=48
      And 好球帶下緣目前為 50
      And 該投球目前判定為壞球
      When 教練 調整好球帶下緣為 45
      Then 該投球應重新判定為好球
