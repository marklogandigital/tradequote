'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Material {
  id?: string
  material_id?: string | null
  material_name: string
  quantity: number
  unit: string
  price_per_unit: number
  line_total: number
  save_to_library?: boolean
}

interface LibraryMaterial {
  id: string
  name: string
  unit: string
  price_per_unit: number
}

export default function QuotePage() {
  const router = useRouter()
  const [clientName, setClientName] = useState('')
  const [jobName, setJobName] = useState('')
  const [notes, setNotes] = useState('')
  const [labourHours, setLabourHours] = useState<number | ''>('')
  const [labourRate, setLabourRate] = useState<number | ''>('')
  const [materials, setMaterials] = useState<Material[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // Modal states
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false)
  const [showLibraryModal, setShowLibraryModal] = useState(false)
  const [libraryMaterials, setLibraryMaterials] = useState<LibraryMaterial[]>([])
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false)
  
  // New material form state
  const [newMaterialName, setNewMaterialName] = useState('')
  const [newMaterialQuantity, setNewMaterialQuantity] = useState<number | ''>('')
  const [newMaterialUnit, setNewMaterialUnit] = useState('')
  const [newMaterialPrice, setNewMaterialPrice] = useState<number | ''>('')
  const [saveToLibrary, setSaveToLibrary] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setIsCheckingAuth(false)
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    }
  }

  // Calculate values
  const labourHoursNum = typeof labourHours === 'number' ? labourHours : 0
  const labourRateNum = typeof labourRate === 'number' ? labourRate : 0
  const labourCost = labourHoursNum * labourRateNum
  const materialsTotal = materials.reduce((sum, mat) => sum + mat.line_total, 0)
  const grandTotal = labourCost + materialsTotal

  const fetchLibraryMaterials = async () => {
    setIsLoadingLibrary(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('materials')
        .select('id, name, unit, price_per_unit')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching library materials:', error)
        return
      }

      setLibraryMaterials(data || [])
    } catch (error) {
      console.error('Error fetching library materials:', error)
    } finally {
      setIsLoadingLibrary(false)
    }
  }

  const handleOpenLibraryModal = () => {
    setShowLibraryModal(true)
    fetchLibraryMaterials()
  }

  const handleAddFromLibrary = (material: LibraryMaterial) => {
    const quantity = 1
    const lineTotal = quantity * material.price_per_unit
    
    const newMaterial: Material = {
      material_id: material.id,
      material_name: material.name,
      quantity: quantity,
      unit: material.unit,
      price_per_unit: material.price_per_unit,
      line_total: lineTotal,
    }

    setMaterials([...materials, newMaterial])
    setShowLibraryModal(false)
  }

  const handleOpenAddMaterialModal = () => {
    setShowAddMaterialModal(true)
    setNewMaterialName('')
    setNewMaterialQuantity('')
    setNewMaterialUnit('')
    setNewMaterialPrice('')
    setSaveToLibrary(false)
  }

  const handleAddNewMaterial = () => {
    if (!newMaterialName.trim() || !newMaterialQuantity || !newMaterialUnit.trim() || !newMaterialPrice) {
      alert('Please fill in all material fields')
      return
    }

    const quantity = typeof newMaterialQuantity === 'number' ? newMaterialQuantity : 0
    const price = typeof newMaterialPrice === 'number' ? newMaterialPrice : 0
    const lineTotal = quantity * price

    const newMaterial: Material = {
      material_name: newMaterialName.trim(),
      quantity: quantity,
      unit: newMaterialUnit.trim(),
      price_per_unit: price,
      line_total: lineTotal,
      save_to_library: saveToLibrary,
    }

    // Debug: Log the material data and checkbox state
    console.log('Adding new material:', {
      material_name: newMaterial.material_name,
      unit: newMaterial.unit,
      price_per_unit: newMaterial.price_per_unit,
      save_to_library: newMaterial.save_to_library,
      checkbox_checked: saveToLibrary,
    })

    setMaterials([...materials, newMaterial])
    setShowAddMaterialModal(false)
    
    // Reset form
    setNewMaterialName('')
    setNewMaterialQuantity('')
    setNewMaterialUnit('')
    setNewMaterialPrice('')
    setSaveToLibrary(false)
  }

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index))
  }

  const handleUpdateMaterialQuantity = (index: number, quantity: number) => {
    const updatedMaterials = [...materials]
    updatedMaterials[index].quantity = quantity
    updatedMaterials[index].line_total = quantity * updatedMaterials[index].price_per_unit
    setMaterials(updatedMaterials)
  }

  const handleSave = async () => {
    if (!clientName.trim() || !jobName.trim()) {
      alert('Please fill in client name and job name')
      return
    }

    if (labourHoursNum <= 0 || labourRateNum <= 0) {
      alert('Please enter valid labour hours and rate')
      return
    }

    setIsSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert('You must be logged in to save quotes')
        router.push('/login')
        setIsSaving(false)
        return
      }

      // Save quote
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          client_name: clientName.trim(),
          job_name: jobName.trim(),
          notes: notes.trim() || null,
          labour_hours: labourHoursNum,
          labour_rate: labourRateNum,
          labour_cost: labourCost,
          materials_total: materialsTotal,
          total_cost: grandTotal,
          user_id: user.id,
        })
        .select()
        .single()

      if (quoteError) {
        console.error('Error saving quote:', quoteError)
        alert('Failed to save quote. Please try again.')
        setIsSaving(false)
        return
      }

      // Save materials to library if needed
      console.log('All materials in quote:', materials)
      const materialsToSave = materials.filter(m => m.save_to_library && !m.material_id)
      console.log('Materials to save to library (filtered):', materialsToSave)
      console.log('User ID:', user.id)

      if (materialsToSave.length > 0) {
        // Check for existing materials to avoid duplicates
        const { data: existingMaterials, error: fetchError } = await supabase
          .from('materials')
          .select('name, unit, price_per_unit')
          .eq('user_id', user.id)

        if (fetchError) {
          console.error('Error checking existing materials:', fetchError)
          // Continue anyway - quote is saved
        } else {
          console.log('Existing materials in library:', existingMaterials)
          
          // Filter out materials that already exist
          const existingSet = new Set(
            (existingMaterials || []).map(m => 
              `${m.name.toLowerCase()}_${m.unit.toLowerCase()}_${m.price_per_unit}`
            )
          )

          const newMaterialsToSave = materialsToSave.filter(m => {
            const key = `${m.material_name.toLowerCase()}_${m.unit.toLowerCase()}_${m.price_per_unit}`
            const exists = existingSet.has(key)
            console.log(`Material "${m.material_name}" (${m.unit}, £${m.price_per_unit}) - exists: ${exists}`)
            return !exists
          })

          console.log('New materials to save (after duplicate check):', newMaterialsToSave)

          if (newMaterialsToSave.length > 0) {
            const libraryInserts = newMaterialsToSave.map(m => ({
              name: m.material_name,
              unit: m.unit,
              price_per_unit: m.price_per_unit,
              user_id: user.id,
            }))

            console.log('Inserting into materials table:', libraryInserts)

            const { data: insertedData, error: materialsError } = await supabase
              .from('materials')
              .insert(libraryInserts)
              .select()

            if (materialsError) {
              console.error('Error saving materials to library:', materialsError)
              console.error('Error details:', {
                message: materialsError.message,
                details: materialsError.details,
                hint: materialsError.hint,
                code: materialsError.code,
              })
              // Continue anyway - quote is saved
            } else {
              console.log('Successfully saved materials to library:', insertedData)
            }
          } else {
            console.log('No new materials to save (all duplicates)')
          }
        }
      } else {
        console.log('No materials marked for saving to library')
      }

      // Save quote items
      if (materials.length > 0) {
        const quoteItems = materials.map(m => ({
          quote_id: quoteData.id,
          material_id: m.material_id || null,
          material_name: m.material_name,
          quantity: m.quantity,
          unit: m.unit,
          price_per_unit: m.price_per_unit,
          line_total: m.line_total,
        }))

        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(quoteItems)

        if (itemsError) {
          console.error('Error saving quote items:', itemsError)
          alert('Quote saved but failed to save some items. Please try again.')
          setIsSaving(false)
          return
        }
      }

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving quote:', error)
      alert('Failed to save quote. Please try again.')
      setIsSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← Back to dashboard
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
          New Quote
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 space-y-12">
          {/* Job Details Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Job Details
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="clientName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Client name
                </label>
                <input
                  type="text"
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label
                  htmlFor="jobName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job name
                </label>
                <input
                  type="text"
                  id="jobName"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  placeholder="Enter job name"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Labour Section */}
          <div className="pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Labour
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="labourHours"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Hours
                </label>
                <input
                  type="number"
                  id="labourHours"
                  value={labourHours}
                  onChange={(e) =>
                    setLabourHours(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  step="0.5"
                  min="0"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label
                  htmlFor="labourRate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Hourly Rate (£)
                </label>
                <input
                  type="number"
                  id="labourRate"
                  value={labourRate}
                  onChange={(e) =>
                    setLabourRate(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            {labourCost > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Labour cost</span>
                  <span className="text-lg font-medium text-gray-900">
                    {formatCurrency(labourCost)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Materials Section */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 md:mb-0">
                Materials
              </h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleOpenLibraryModal}
                  className="px-4 py-2 bg-white text-gray-900 text-base font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                >
                  Add from Library
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddMaterialModal}
                  className="px-4 py-2 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Add New Material
                </button>
              </div>
            </div>

            {materials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No materials added yet. Click "Add from Library" or "Add New Material" to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Material</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Quantity</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Unit</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Price/Unit</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Line Total</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{material.material_name}</td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={material.quantity}
                            onChange={(e) =>
                              handleUpdateMaterialQuantity(index, parseFloat(e.target.value) || 0)
                            }
                            step="0.01"
                            min="0"
                            className="w-20 ml-auto text-right px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                          />
                        </td>
                        <td className="py-3 px-4 text-gray-600">{material.unit}</td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {formatCurrency(material.price_per_unit)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          {formatCurrency(material.line_total)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {materialsTotal > 0 && (
              <div className="mt-4 flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Materials subtotal</span>
                    <span className="text-lg font-medium text-gray-900">
                      {formatCurrency(materialsTotal)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Total Section */}
          {(labourCost > 0 || materialsTotal > 0) && (
            <div className="pt-8 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  {labourCost > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Labour cost</span>
                      <span className="text-lg font-medium text-gray-900">
                        {formatCurrency(labourCost)}
                      </span>
                    </div>
                  )}
                  {materialsTotal > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Materials subtotal</span>
                      <span className="text-lg font-medium text-gray-900">
                        {formatCurrency(materialsTotal)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                    <span className="text-lg font-semibold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-8 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white text-lg font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Quote'}
            </button>
          </div>
        </div>
      </div>

      {/* Library Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Select from Library</h3>
                <button
                  onClick={() => setShowLibraryModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingLibrary ? (
                <p className="text-gray-600 text-center py-8">Loading materials...</p>
              ) : libraryMaterials.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No materials in your library yet.</p>
              ) : (
                <div className="space-y-2">
                  {libraryMaterials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => handleAddFromLibrary(material)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{material.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(material.price_per_unit)} per {material.unit}
                          </p>
                        </div>
                        <span className="text-gray-400">+</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowLibraryModal(false)}
                className="w-full px-4 py-2 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Material Modal */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Add New Material</h3>
                <button
                  onClick={() => setShowAddMaterialModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material name
                </label>
                <input
                  type="text"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  placeholder="e.g. Cement, Sand, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={newMaterialQuantity}
                    onChange={(e) =>
                      setNewMaterialQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newMaterialUnit}
                    onChange={(e) => setNewMaterialUnit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="e.g. bag, metre"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per unit (£)
                </label>
                <input
                  type="number"
                  value={newMaterialPrice}
                  onChange={(e) =>
                    setNewMaterialPrice(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="saveToLibrary"
                  checked={saveToLibrary}
                  onChange={(e) => setSaveToLibrary(e.target.checked)}
                  className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                />
                <label htmlFor="saveToLibrary" className="ml-2 text-sm text-gray-700">
                  Save to my library for future use
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="flex-1 px-4 py-2 bg-white text-gray-900 text-base font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewMaterial}
                className="flex-1 px-4 py-2 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Add Material
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
