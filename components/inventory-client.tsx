"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type Material = {
  id: string
  name: string
  category: string
  stock: number
  unit: string
  status: string
}

import { requestMaterials } from "@/app/actions"
import { useTransition } from "react"
import { toast } from "sonner"

export function InventoryClient({ initialData }: { initialData: Material[] }) {
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()
  
  const filteredData = initialData.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.id.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleAll = () => {
    setSelected(selected.length === filteredData.length ? [] : filteredData.map(m => m.id))
  }

  const handleRequest = () => {
    startTransition(async () => {
      const result = await requestMaterials(selected)
      if (result.success) {
        toast.success(result.message)
        setSelected([])
      } else {
        toast.error(result.message || "เกิดข้อผิดพลาด")
      }
    })
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-xl kanit-semibold">รายการพัสดุคงคลัง</h3>
        <Input 
          placeholder="ค้นหาพัสดุ..." 
          className="w-[300px] kanit-regular rounded-full bg-white shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selected.length === filteredData.length && filteredData.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="kanit-semibold">รหัสพัสดุ</TableHead>
              <TableHead className="kanit-semibold">ชื่อพัสดุ</TableHead>
              <TableHead className="kanit-semibold">หมวดหมู่</TableHead>
              <TableHead className="kanit-semibold text-right">คงเหลือ</TableHead>
              <TableHead className="kanit-semibold">หน่วยนับ</TableHead>
              <TableHead className="kanit-semibold">สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground kanit-regular">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : filteredData.map((item) => (
              <TableRow key={item.id} data-state={selected.includes(item.id) && "selected"} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <Checkbox 
                    checked={selected.includes(item.id)}
                    onCheckedChange={() => toggleSelect(item.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground" title={item.id}>{item.id.split('-')[0] + '...'}</TableCell>
                <TableCell className="kanit-medium">{item.name}</TableCell>
                <TableCell className="kanit-regular text-muted-foreground">{item.category}</TableCell>
                <TableCell className="kanit-semibold text-right">{item.stock}</TableCell>
                <TableCell className="kanit-regular text-muted-foreground">{item.unit}</TableCell>
                <TableCell>
                  <Badge 
                    variant={item.status === "มีพัสดุ" ? "default" : item.status === "ใกล้หมด" ? "secondary" : "destructive"}
                    className="kanit-regular px-2 py-0.5 rounded-full"
                  >
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary/95 backdrop-blur-md text-primary-foreground px-6 py-4 rounded-full shadow-2xl flex items-center justify-between gap-8 border border-white/10 animate-in slide-in-from-bottom-10">
          <div className="kanit-medium">เลือกแล้ว <span className="kanit-bold text-lg mx-1">{selected.length}</span> รายการ</div>
          <Button 
            variant="secondary" 
            className="kanit-semibold rounded-full px-6 shadow-sm hover:scale-105 transition-transform text-primary"
            onClick={handleRequest}
            disabled={isPending}
          >
            {isPending ? "กำลังดำเนินการ..." : "ดำเนินการทำเรื่องเบิก"}
          </Button>
        </div>
      )}
    </div>
  )
}
