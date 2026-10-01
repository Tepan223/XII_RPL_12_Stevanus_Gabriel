const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "gudang",
});

connection.connect((err) => {
  if (err) {
    console.error("Koneksi database gagal:", err);
    return;
  }

  console.log("Database berhasil terhubung");
});

app.get("/produk", (req, res) => {
  const sql = `
    SELECT
      products.id,
      products.category_id,
      products.code,
      products.name,
      products.unit,
      products.stock,
      categories.name AS category
    FROM products
    JOIN categories
      ON products.category_id = categories.id
    ORDER BY products.id ASC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil data produk",
      });
    }

    res.json(results);
  });
});

app.get("/categories", (req, res) => {
  const sql = `
    SELECT id, name
    FROM categories
    ORDER BY id ASC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil data kategori",
      });
    }

    res.json(results);
  });
});

app.get("/transactions", (req, res) => {
  const sql = `
    SELECT
      transactions.id,
      transactions.type AS typeValue,
      DATE_FORMAT(transactions.transaction_date, '%Y-%m-%d') AS dateValue,
      DATE_FORMAT(transactions.transaction_date, '%d %b %Y') AS date,
      transactions.description,
      products.id AS product_id,
      products.name AS product,
      transaction_details.quantity
    FROM transactions
    JOIN transaction_details
      ON transactions.id = transaction_details.transaction_id
    JOIN products
      ON transaction_details.product_id = products.id
    ORDER BY transactions.id DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil data transaksi",
        error: err.message,
      });
    }

    res.json(results);
  });
});

app.post("/produk", (req, res) => {
  const { category_id, code, name, unit, price, stock } = req.body;

  if (
    !category_id ||
    !code ||
    !name ||
    !unit ||
    price === undefined ||
    stock === undefined
  ) {
    return res.status(400).json({
      message: "Data produk belum lengkap",
    });
  }

  const sql = `
    INSERT INTO products
    (category_id, code, name, unit, price, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [category_id, code, name, unit, price, stock],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal menambahkan produk",
        });
      }

      res.status(201).json({
        message: "Produk berhasil ditambahkan",
      });
    },
  );
});

app.post("/transactions", (req, res) => {
  const { type, transaction_date, product_id, quantity, description } =
    req.body;

  if (!type || !transaction_date || !product_id || !quantity) {
    return res.status(400).json({
      message: "Data transaksi belum lengkap",
    });
  }

  const stockSql = `
    SELECT stock
    FROM products
    WHERE id = ?
  `;

  connection.query(stockSql, [product_id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal memeriksa stok",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    const stock = results[0].stock;

    if (type === "OUT" && quantity > stock) {
      return res.status(400).json({
        message: "Stok tidak mencukupi",
      });
    }

    const newStock = type === "IN" ? stock + quantity : stock - quantity;

    const transactionSql = `
      INSERT INTO transactions
      (type, transaction_date, description)
      VALUES (?, ?, ?)
    `;

    connection.query(
      transactionSql,
      [type, transaction_date, description || null],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Gagal menambahkan transaksi",
          });
        }

        const detailSql = `
          INSERT INTO transaction_details
          (transaction_id, product_id, quantity)
          VALUES (?, ?, ?)
        `;

        connection.query(
          detailSql,
          [result.insertId, product_id, quantity],
          (err) => {
            if (err) {
              return res.status(500).json({
                message: "Gagal menyimpan detail transaksi",
              });
            }

            const updateSql = `
              UPDATE products
              SET stock = ?
              WHERE id = ?
            `;

            connection.query(updateSql, [newStock, product_id], (err) => {
              if (err) {
                return res.status(500).json({
                  message: "Gagal memperbarui stok",
                });
              }

              res.status(201).json({
                message: "Transaksi berhasil ditambahkan",
              });
            });
          },
        );
      },
    );
  });
});

app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { category_id, code, name, price, stock } = req.body;

  if (
    !category_id ||
    !code ||
    !name ||
    price === undefined ||
    stock === undefined
  ) {
    return res.status(400).json({
      message: "Data produk belum lengkap",
    });
  }

  const sql = `
    UPDATE products
    SET
      category_id = ?,
      code = ?,
      name = ?,
      price = ?,
      stock = ?
    WHERE id = ?
  `;

  connection.query(
    sql,
    [category_id, code, name, price, stock, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal mengubah produk",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Produk tidak ditemukan",
        });
      }

      res.json({
        message: "Produk berhasil diubah",
      });
    },
  );
});

app.put("/transactions/:id", (req, res) => {
  const { id } = req.params;
  const { type, transaction_date, product_id, quantity, description } =
    req.body;

  if (!type || !transaction_date || !product_id || !quantity) {
    return res.status(400).json({
      message: "Data transaksi belum lengkap",
    });
  }

  const oldSql = `
    SELECT
      transactions.type,
      transaction_details.product_id,
      transaction_details.quantity
    FROM transactions
    JOIN transaction_details
      ON transactions.id = transaction_details.transaction_id
    WHERE transactions.id = ?
  `;

  connection.query(oldSql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil transaksi",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan",
      });
    }

    const old = results[0];

    const oldEffect = old.type === "IN" ? -old.quantity : old.quantity;

    const newEffect = type === "IN" ? quantity : -quantity;

    const stockSql = `
      UPDATE products
      SET stock = stock + ?
      WHERE id = ?
    `;

    connection.query(stockSql, [oldEffect, old.product_id], (err) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal mengembalikan stok",
        });
      }

      connection.query(stockSql, [newEffect, product_id], (err) => {
        if (err) {
          return res.status(500).json({
            message: "Gagal memperbarui stok",
          });
        }

        const transactionSql = `
              UPDATE transactions
              SET
                type = ?,
                transaction_date = ?,
                description = ?
              WHERE id = ?
            `;

        connection.query(
          transactionSql,
          [type, transaction_date, description || null, id],
          (err) => {
            if (err) {
              return res.status(500).json({
                message: "Gagal mengubah transaksi",
              });
            }

            const detailSql = `
                  UPDATE transaction_details
                  SET
                    product_id = ?,
                    quantity = ?
                  WHERE transaction_id = ?
                `;

            connection.query(detailSql, [product_id, quantity, id], (err) => {
              if (err) {
                return res.status(500).json({
                  message: "Gagal mengubah detail transaksi",
                });
              }

              res.json({
                message: "Transaksi berhasil diubah",
              });
            });
          },
        );
      });
    });
  });
});

app.delete("/products/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM products
    WHERE id = ?
  `;

  connection.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal menghapus produk",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    res.json({
      message: "Produk berhasil dihapus",
    });
  });
});

app.delete("/transactions/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM transactions
    WHERE id = ?
  `;

  connection.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal menghapus transaksi",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan",
      });
    }

    res.json({
      message: "Transaksi berhasil dihapus",
    });
  });
});

app.listen(5000, () => {
  console.log("Server berjalan di http://localhost:5000");
});