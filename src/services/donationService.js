import localforage from 'localforage'

// 初始化 localforage 實例
const donationsStore = localforage.createInstance({
  name: 'donations'
})

// 儲存抖內
export const saveDonation = async (donation) => {
  try {
    await donationsStore.setItem(donation.id, donation)
    return true
  } catch (error) {
    console.error('儲存抖內錯誤:', error)
    throw error
  }
}

// 獲取所有抖內記錄
export const getAllDonations = async () => {
  try {
    const donations = []
    
    await donationsStore.iterate((value) => {
      donations.push(value)
    })
    
    // 按創建時間排序（降序）
    return donations.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at)
    })
  } catch (error) {
    console.error('獲取所有抖內錯誤:', error)
    throw error
  }
}

// 獲取抖內總金額
export const getDonationsTotal = async () => {
  try {
    const donations = await getAllDonations()
    return donations.reduce((total, donation) => total + donation.total_price, 0)
  } catch (error) {
    console.error('獲取抖內總金額錯誤:', error)
    throw error
  }
}