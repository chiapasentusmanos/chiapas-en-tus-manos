"use client";

import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";

type BrandProduct = {
  id: string;
  name: string;
  productCategory: string;
  originMunicipality: string;
  price: string;
  stock: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export function BrandChiapasDashboard() {
  const [products, setProducts] = useState<BrandProduct[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const response = await fetch("/api/brand-products?status=mine");
    setProducts((await response.json()).products || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/brand-products", {
      method: "POST",
      body: data
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(payload.error || "No se pudo crear el producto");
      return;
    }
    event.currentTarget.reset();
    setMessage("Producto creado. Queda pendiente de aprobacion.");
    await load();
  }

  return (
    <div className="dashboard" style={{ marginTop: 24 }}>
      <form className="panel form-grid" onSubmit={submit}>
        <h2 className="full" style={{ margin: 0 }}>Nuevo producto Marca Chiapas</h2>
        <div className="field full">
          <label>Nombre del producto</label>
          <input name="name" required />
        </div>
        <div className="field">
          <label>Categoria de producto</label>
          <select name="productCategory" required defaultValue="">
            <option value="" disabled>Selecciona</option>
            <option value="Textiles">Textiles</option>
            <option value="Cafe y cacao">Cafe y cacao</option>
            <option value="Alimentos y bebidas">Alimentos y bebidas</option>
            <option value="Artesanias">Artesanias</option>
            <option value="Joyería y ambar">Joyeria y ambar</option>
            <option value="Cosmetica natural">Cosmetica natural</option>
            <option value="Moda y accesorios">Moda y accesorios</option>
            <option value="Decoracion">Decoracion</option>
          </select>
        </div>
        <div className="field">
          <label>Municipio de origen</label>
          <input name="originMunicipality" required />
        </div>
        <div className="field">
          <label>Precio MXN</label>
          <input name="price" type="number" min="0" step="1" required />
        </div>
        <div className="field">
          <label>Existencias</label>
          <input name="stock" type="number" min="0" step="1" defaultValue="0" />
        </div>
        <div className="field">
          <label>WhatsApp</label>
          <input name="whatsapp" placeholder="529611234567" required />
        </div>
        <div className="field full">
          <label>Formas de pago</label>
          <div className="check-grid">
            <label><input name="paymentMethods" type="checkbox" value="TRANSFER" defaultChecked /> Transferencia</label>
            <label><input name="paymentMethods" type="checkbox" value="CARD" defaultChecked /> Tarjeta Visa / Mastercard</label>
          </div>
        </div>
        <div className="field full">
          <label>Descripcion</label>
          <textarea name="description" required />
        </div>
        <div className="field">
          <label>Materiales / ingredientes</label>
          <textarea name="materials" />
        </div>
        <div className="field">
          <label>Presentacion</label>
          <textarea name="presentation" placeholder="Bolsa 500 g, pieza unica, caja regalo..." />
        </div>
        <div className="field full">
          <label>Envios y entrega</label>
          <textarea name="shipping" placeholder="Entrega local, envio nacional, tiempos estimados..." />
        </div>
        <div className="field full">
          <label>Fotos por URL</label>
          <textarea name="images" placeholder="Una URL por linea" />
        </div>
        {message && <div className={`message full ${message.includes("No ") ? "error" : ""}`}>{message}</div>}
        <button className="button full" disabled={loading} type="submit">
          <PlusCircle size={18} /> {loading ? "Guardando..." : "Crear producto"}
        </button>
      </form>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Mis productos</h2>
        <div className="table-list">
          {products.map((product) => (
            <div className="row-item" key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <div className="muted">
                  {product.productCategory} · {product.originMunicipality} · ${Number(product.price).toLocaleString("es-MX")} · {product.stock} pza(s)
                </div>
              </div>
              <span className={`badge ${product.status === "PENDING" ? "pending" : product.status === "REJECTED" ? "rejected" : ""}`}>
                {product.status === "PENDING" ? "Pendiente" : product.status === "APPROVED" ? "Aprobado" : "Rechazado"}
              </span>
            </div>
          ))}
          {products.length === 0 && <p className="muted">Aun no tienes productos.</p>}
        </div>
      </div>
    </div>
  );
}
