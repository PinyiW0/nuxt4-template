# language: zh-TW
# encoding: UTF-8
# Feature: 直播影像播放
# Epic: G - 影像播放（Live / Replay）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-g @video @command
Feature: 直播影像播放
  身為 場邊操作人員
  我想要 播放直播串流
  以便 即時監看訓練畫面

  Background:
    Given 場邊操作人員 已登入系統

  Rule: 可以播放 HLS 直播串流

    @happy-path
    Example: 成功播放直播
      Given 直播串流已啟動
      When 場邊操作人員 開始播放直播
      Then 應成功播放直播畫面
      And 應顯示直播狀態為 "播放中"

    @error-handling
    Example: 直播串流不可用時顯示錯誤
      Given 直播串流未啟動
      When 場邊操作人員 嘗試播放直播
      Then 應顯示錯誤 "直播串流不可用"

  Rule: 可以暫停/繼續播放

    @happy-path
    Example: 暫停直播
      Given 直播正在播放中
      When 場邊操作人員 暫停直播
      Then 直播應暫停
      And 應顯示直播狀態為 "已暫停"

    @happy-path
    Example: 繼續播放直播
      Given 直播已暫停
      When 場邊操作人員 繼續播放直播
      Then 直播應繼續播放
      And 應顯示直播狀態為 "播放中"

  Rule: 顯示直播狀態

    @happy-path
    Example: 顯示直播連線狀態
      Given 直播正在播放中
      When 場邊操作人員 查看直播狀態
      Then 應顯示連線狀態為 "已連線"

    @error-handling
    Example: 直播中斷時顯示重連提示
      Given 直播正在播放中
      When 直播連線中斷
      Then 應顯示 "連線中斷，嘗試重新連線..."
