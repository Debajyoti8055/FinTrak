import { getUserAccounts } from '@/actions/dashboard'
import { defaultCategories } from '@/app/data/categories'
import React from 'react'
import { get } from 'react-hook-form'
import AddTransactionForm from '../_components/AddTransactionForm'
import { getTransaction } from '@/actions/transaction'

const AdTransactionPage = async ({ searchParams }) => {
    const accounts = await getUserAccounts()
    const editId = searchParams?.edit
    // console.log(editId)

    let initialData = null
    if (editId) {
        const transaction = await getTransaction(editId)
        initialData = transaction
    }

    return (
        <div className='max-w-3xl mx-auto px-5'>
            <h1 className='text-5xl gradient-title mb-8'>
                {editId ? "Edit" : "Add"} Transaction
            </h1>
            <AddTransactionForm
                accounts={accounts}
                categories={defaultCategories}
                editMode={!!editId}
                initialData={initialData}
            />
        </div>
    )
}

export default AdTransactionPage