# language: zh-TW
# encoding: UTF-8
# Feature: 回放影片雙畫面同步
# Epic: G - 影像播放（Live / Replay）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-g @video @command
Feature: 回放影片雙畫面同步
  身為 分析使用者
  我想要 同步播放兩個角度的回放影片
  以便 比較動作或判讀

  Background:
    Given 分析使用者 已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有訓練紀錄，日期 "2026-01-20"
    And 該訓練有投球影片（正面角度和側面角度）

  Rule: 可以同時播放兩個角度的影片

    @happy-path
    Example: 開啟雙畫面回放
      When 分析使用者 開啟雙畫面回放
      Then 應同時顯示兩個影片畫面
      And 畫面 1 應顯示正面角度
      And 畫面 2 應顯示側面角度

    @error-handling
    Example: 僅有單一角度時無法開啟雙畫面
      Given 該訓練只有正面角度的影片
      When 分析使用者 嘗試開啟雙畫面回放
      Then 應顯示錯誤 "無足夠的影片角度"

  Rule: 兩個影片同步播放

    @happy-path
    Example: 播放時兩畫面同步
      Given 分析使用者 已開啟雙畫面回放
      When 分析使用者 開始播放
      Then 兩個畫面應同步播放
      And 兩個畫面的播放進度應相同

    @happy-path
    Example: 拖動進度條時兩畫面同步
      Given 分析使用者 已開啟雙畫面回放
      When 分析使用者 拖動進度條到 50%
      Then 兩個畫面應跳轉到 50% 位置

  Rule: 可以暫停/繼續播放

    @happy-path
    Example: 暫停雙畫面回放
      Given 雙畫面回放正在播放中
      When 分析使用者 暫停播放
      Then 兩個畫面應同時暫停

    @happy-path
    Example: 繼續播放雙畫面回放
      Given 雙畫面回放已暫停
      When 分析使用者 繼續播放
      Then 兩個畫面應同時繼續播放
