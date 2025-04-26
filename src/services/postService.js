import localforage from 'localforage'
import dayjs from 'dayjs'
import { addEligibleAccount } from './dbService.js'

const postsStore = localforage.createInstance({
  name: 'posts'
})

let currentId = 0

const getNextId = () => {
  currentId += 1
  return currentId
}

export const savePost = async (post) => {
  try {
    const newPost = {
      ...post,
      id: getNextId()
    }
    await postsStore.setItem(String(newPost.id), newPost)
    return true
  } catch (error) {
    console.error('儲存推文錯誤:', error)
    throw error
  }
}

export const checkDailySubmission = async (gameId) => {
  try {
    const posts = await getAllPosts()
    const today = dayjs().startOf('day')
    
    const existingPost = posts.find(post => {
      return post.game_id === gameId && 
             dayjs(post.created_at).startOf('day').isSame(today)
    })
    
    return !!existingPost
  } catch (error) {
    console.error('檢查每日提交限制錯誤:', error)
    throw error
  }
}

export const getAllPosts = async () => {
  try {
    const posts = []
    
    await postsStore.iterate((value) => {
      posts.push(value)
    })
    
    return posts.sort((a, b) => a.id - b.id)
  } catch (error) {
    console.error('獲取所有推文錯誤:', error)
    throw error
  }
}

export const getPendingPosts = async () => {
  try {
    const posts = await getAllPosts()
    return posts.filter(post => post.status === 'pending')
  } catch (error) {
    console.error('獲取待審核推文錯誤:', error)
    throw error
  }
}

export const getPendingPostsCount = async () => {
  try {
    const pendingPosts = await getPendingPosts()
    return pendingPosts.length
  } catch (error) {
    console.error('獲取待審核推文數量錯誤:', error)
    throw error
  }
}

export const updatePostStatus = async (id, status) => {
  try {
    const post = await postsStore.getItem(String(id))
    
    if (!post) {
      throw new Error('推文不存在')
    }
    
    post.status = status
    await postsStore.setItem(String(id), post)
    
    if (status === 'approved') {
      const result = await addEligibleAccount(post.game_id)
      
      if (!result.success) {
        throw new Error(result.message || '添加資格失敗')
      }
    }
    
    return true
  } catch (error) {
    console.error('更新推文狀態錯誤:', error)
    throw error
  }
}