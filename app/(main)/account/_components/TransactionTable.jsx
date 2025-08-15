"use client"

import { bulkDeleteTransaction } from '@/actions/accounts'
import { categoryColors } from '@/app/data/categories'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import useFetch from '@/hooks/useFetch'
import { format } from 'date-fns'
import { se } from 'date-fns/locale'
import { ChevronDown, ChevronUp, Clock, Icon, MoreHorizontal, RefreshCcw, RefreshCw, Search, Trash, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { BarLoader } from 'react-spinners'
import { toast } from 'sonner'
import { set } from 'zod'

const RECURRING_INTERVALS = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    YEARLY: 'Yearly',
}

const TransactionTable = ({ transactions }) => {

    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState([]);
    const [sortConfig, setSortConfig] = useState({ field: 'date', direction: 'desc' })

    const [searchTerm, setsearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [recurringFilter, setRecurringFilter] = useState("")

    const { loading: deleteLoading, error, fn: deleteFn, data: deleted } = useFetch(bulkDeleteTransaction)

    // console.log(selectedIds)
    const filterAndSortedTransactions = useMemo(() => {

        let result = [...transactions]

        //apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            result = result.filter((transaction) => transaction.description.toLowerCase().includes(searchLower))
        }

        //apply recurring filter
        if (recurringFilter) {
            result = result.filter((transaction) => {
                if (recurringFilter === 'recurring') return transaction.isRecurring
                return !transaction.isRecurring
            })
        }

        //Apply type filter
        if (typeFilter) {
            result = result.filter((transaction) => transaction.type === typeFilter)
        }

        //apply sorting
        result.sort((a, b) => {
            let comparison = 0

            switch (sortConfig.field) {
                case "date":
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case "amount":
                    comparison = a.amount - b.amount
                    break;
                case "category":
                    comparison = a.category.localeCompare(b.category)
                    break;

                default:
                    comparison = 0;
            }
            return sortConfig.direction === "asc" ? comparison : -comparison
        })

        return result

    }, [
        transactions,
        searchTerm,
        typeFilter,
        recurringFilter,
        sortConfig
    ])

    const handleSort = (field) => {
        setSortConfig((current) => ({
            field,
            direction:
                current.field === field && current.direction === "asc" ? "desc" : "asc",
        }));
    };

    const handleSelect = (id) => {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    };
    const handleSelectAll = (id) => {
        setSelectedIds((current) =>
            current.length === filterAndSortedTransactions.length
                ? []
                : filterAndSortedTransactions.map((item) => item.id)
        );
    }

    const handleBulkDelete = async () => {
        if (!window.confirm(
            `Are you sure you want to delete ${selectedIds.length} transactions?`
        )) {
            return
        }
        deleteFn(selectedIds)
    }

    useEffect(() => {
        if (deleted && !deleteLoading) {
            toast.error("Transaction deleted successfully")
        }
    }, [deleted, deleteLoading])

    const handleClearFilters = () => {
        setsearchTerm("")
        setTypeFilter("")
        setRecurringFilter("")
        setSelectedIds([])
    }

    return (
        <div className='space-y-4'>
            {deleteLoading && (<BarLoader className='mt-4' width={"100%"} color='#9333ea' />)}

            {/* Filters */}

            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative flex-1'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input className="pl-8"
                        placeholder="Search Transaction"
                        value={searchTerm}
                        onChange={(e) => setsearchTerm(e.target.value)}

                    />
                </div>
                <div className='flex gap-2'>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={recurringFilter} onValueChange={(value) => setRecurringFilter(value)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Transactions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recurring">Recurring Only</SelectItem>
                            <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
                        </SelectContent>
                    </Select>

                    {
                        selectedIds.length > 0 && <div>
                            <Button className="flex items-center gap-2" variant="destructive" size="sm" onClick={handleBulkDelete}>
                                <Trash className='h-4 w-4 mr-2' />
                                Delete Selected ({selectedIds.length})
                            </Button>
                        </div>
                    }

                    {
                        (searchTerm || typeFilter || recurringFilter) && (
                            <Button variant="outline" size="icon" onClick={handleClearFilters} title="Clear Filters">
                                <X className='h-4 w-4' />
                            </Button>
                        )
                    }
                </div>
            </div>




            {/* Transactions */}


            <div className='rounded-md border'>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox onCheckedChange={handleSelectAll}
                                    checked={
                                        selectedIds.length === filterAndSortedTransactions.length && filterAndSortedTransactions.length > 0
                                    }
                                />
                            </TableHead>
                            <TableHead className="cursor-pointer"
                                onClick={() => handleSort("date")}
                            >
                                <div className='flex items-center'>
                                    Date{""} {sortConfig.field === "date" && (
                                        sortConfig.direction === "asc" ? (<ChevronUp className="ml-1 h-4 w-4" />)
                                            : (
                                                <ChevronDown className="ml-1 h-4 w-4" />))
                                    }
                                </div>
                            </TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="cursor-pointer"
                                onClick={() => handleSort("category")}
                            >
                                <div className='flex items-center'>
                                    Category{""} {sortConfig.field === "category" && (
                                        sortConfig.direction === "asc" ? (<ChevronUp className="ml-1 h-4 w-4" />)
                                            : (
                                                <ChevronDown className="ml-1 h-4 w-4" />))
                                    }
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer text-right"
                                onClick={() => handleSort("amount")}
                            >
                                <div className='flex items-center justify-end'>
                                    Amount{""} {sortConfig.field === "amount" && (
                                        sortConfig.direction === "asc" ? (<ChevronUp className="ml-1 h-4 w-4" />)
                                            : (
                                                <ChevronDown className="ml-1 h-4 w-4" />))
                                    }
                                </div>
                            </TableHead>
                            <TableHead>Recurring</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filterAndSortedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className={"text-center text-muted-foreground"}>
                                    No Transactions Found
                                </TableCell>
                            </TableRow>

                        ) : (
                            filterAndSortedTransactions.map((transactions) => (
                                <TableRow key={transactions.id} >
                                    <TableCell>
                                        <Checkbox onClick={() => handleSelect(transactions.id)}
                                            checked={selectedIds.includes(transactions.id)} />
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(transactions.date), "PP")}
                                    </TableCell>
                                    <TableCell>{transactions.description}</TableCell>
                                    <TableCell className="capitalize">
                                        <span style={{
                                            background: categoryColors[transactions.category],
                                        }} className='px-2 py-1 rounded-md text-white text-sm'>
                                            {transactions.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium" style={{
                                        color: transactions.type === 'EXPENSE' ? 'red' : 'green'
                                    }}>
                                        {transactions.type === 'EXPENSE' ? "-" : "+"}
                                        ${transactions.amount.toFixed(2)}</TableCell>
                                    <TableCell>{transactions.isRecurring ? (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant='outline' className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-300">
                                                    <RefreshCw className='h-4 w-4' />
                                                    {RECURRING_INTERVALS[transactions.recurringInterval]}
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className='text-sm'>
                                                    <div className='font-medium'>
                                                        Next Date: {format(new Date(transactions.nextRecurringDate), "PP")}
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : <Badge variant='outline' className="gap-1">
                                        <Clock className='h-4 w-4' />
                                        one-time
                                    </Badge>}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost">
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/transaction/create?edit=${transactions.id}`)}
                                                >
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() =>
                                                    deleteFn([transactions.id])
                                                }>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div >
    )
}

export default TransactionTable