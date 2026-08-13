"use client"

import { useState } from "react"
import { Package, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { addMaterial, updateMaterial, deleteMaterial } from "@/app/inventory/actions"

export type Category = { id: string, name: string }
export type Material = { id: string, name: string, category_id: string, category_name: string, balance: number, unit: string }

export function InventoryManager({ 
  initialMaterials, 
  categories 
}: { 
  initialMaterials: Material[], 
  categories: Category[] 
}) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<Material | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await addMaterial(formData)
    setIsLoading(false)
    
    if (result.success) {
      toast.success(result.message)
      setIsAddOpen(false)
    } else {
      toast.error(result.message)
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editItem) return
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateMaterial(editItem.id, formData)
    setIsLoading(false)
    
    if (result.success) {
      toast.success(result.message)
      setEditItem(null)
    } else {
      toast.error(result.message)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsLoading(true)
    const result = await deleteMaterial(deleteId)
    setIsLoading(false)
    
    if (result.success) {
      toast.success(result.message)
      setDeleteId(null)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl kanit-bold tracking-tight text-primary">จัดการคลังวัสดุ</h2>
          <p className="kanit-regular text-muted-foreground mt-1">เพิ่ม ลบ หรือแก้ไขข้อมูลวัสดุในระบบ</p>
        </div>
        <Button 
          onClick={() => setIsAddOpen(true)}
          className="kanit-medium bg-primary hover:bg-primary/90 rounded-full shadow-md"
        >
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มรายการใหม่
        </Button>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="kanit-semibold pl-6">รหัสวัสดุ</TableHead>
              <TableHead className="kanit-semibold">ชื่อวัสดุ</TableHead>
              <TableHead className="kanit-semibold">หมวดหมู่</TableHead>
              <TableHead className="kanit-semibold text-right">คงเหลือ</TableHead>
              <TableHead className="kanit-semibold">หน่วยนับ</TableHead>
              <TableHead className="kanit-semibold">สถานะ</TableHead>
              <TableHead className="kanit-semibold text-right pr-6">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialMaterials.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-xs text-muted-foreground pl-6" title={item.id}>
                  {item.id.split('-')[0] + '...'}
                </TableCell>
                <TableCell className="kanit-medium">{item.name}</TableCell>
                <TableCell className="kanit-regular text-muted-foreground">{item.category_name}</TableCell>
                <TableCell className="kanit-semibold text-right">{item.balance}</TableCell>
                <TableCell className="kanit-regular text-muted-foreground">{item.unit}</TableCell>
                <TableCell>
                  <Badge 
                    variant={item.balance > 20 ? "default" : item.balance > 0 ? "secondary" : "destructive"}
                    className="kanit-regular px-2 py-0.5 rounded-full"
                  >
                    {item.balance > 20 ? "มีสินค้า" : item.balance > 0 ? "ใกล้หมด" : "หมด"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setEditItem(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {initialMaterials.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 kanit-regular text-muted-foreground">
                  ไม่พบข้อมูลวัสดุ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle className="kanit-bold text-xl text-primary">เพิ่มวัสดุใหม่</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 kanit-regular">
              <div className="space-y-2">
                <Label htmlFor="name" className="kanit-medium">ชื่อวัสดุ</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category_id" className="kanit-medium">หมวดหมู่</Label>
                <Select name="category_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id} className="kanit-regular">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="balance" className="kanit-medium">จำนวนตั้งต้น</Label>
                  <Input id="balance" name="balance" type="number" min="0" required defaultValue="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit" className="kanit-medium">หน่วยนับ</Label>
                  <Input id="unit" name="unit" placeholder="เช่น ชิ้น, กล่อง" required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="kanit-medium rounded-full">
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading} className="kanit-medium rounded-full bg-primary hover:bg-primary/90">
                {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {editItem && (
            <form onSubmit={handleEdit}>
              <DialogHeader>
                <DialogTitle className="kanit-bold text-xl text-primary">แก้ไขข้อมูลวัสดุ</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 kanit-regular">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="kanit-medium">ชื่อวัสดุ</Label>
                  <Input id="edit-name" name="name" required defaultValue={editItem.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category_id" className="kanit-medium">หมวดหมู่</Label>
                  <Select name="category_id" required defaultValue={editItem.category_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id} className="kanit-regular">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-balance" className="kanit-medium">คงเหลือ</Label>
                    <Input id="edit-balance" name="balance" type="number" min="0" required defaultValue={editItem.balance} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit" className="kanit-medium">หน่วยนับ</Label>
                    <Input id="edit-unit" name="unit" required defaultValue={editItem.unit} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditItem(null)} className="kanit-medium rounded-full">
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isLoading} className="kanit-medium rounded-full bg-primary hover:bg-primary/90">
                  {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="kanit-bold text-xl text-destructive">ยืนยันการลบข้อมูล</DialogTitle>
          </DialogHeader>
          <div className="py-4 kanit-regular text-muted-foreground">
            คุณแน่ใจหรือไม่ว่าต้องการลบวัสดุนี้? ข้อมูลนี้จะไม่สามารถกู้คืนได้
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)} className="kanit-medium rounded-full">
              ยกเลิก
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading} className="kanit-medium rounded-full">
              {isLoading ? "กำลังลบ..." : "ยืนยันการลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
