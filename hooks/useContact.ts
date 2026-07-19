import { submitContactMessage } from '@/api/contact'
import { useMutation } from '@tanstack/react-query'

export const useSubmitContactMessage = () => useMutation({
    mutationFn: submitContactMessage,
})
