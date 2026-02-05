"""
Modelos de datos SQLAlchemy
Equivalentes a los modelos Django originales
"""

from datetime import date
from sqlalchemy import Column, Integer, String, Float, Text, Date, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


# Tablas de asociación Many-to-Many
producte_familia = Table(
    'producte_familia',
    Base.metadata,
    Column('producte_id', Integer, ForeignKey('productes.id'), primary_key=True),
    Column('familia_id', Integer, ForeignKey('families.id'), primary_key=True)
)

producte_categoria = Table(
    'producte_categoria',
    Base.metadata,
    Column('producte_id', Integer, ForeignKey('productes.id'), primary_key=True),
    Column('categoria_id', Integer, ForeignKey('categories.id'), primary_key=True)
)


class Familia(Base):
    """Modelo de Familia de productos"""
    __tablename__ = 'families'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nom = Column(String(50), nullable=False, unique=True)

    # Relación inversa
    productes = relationship('Producte', secondary=producte_familia, back_populates='families')

    def __repr__(self):
        return f"<Familia(id={self.id}, nom='{self.nom}')>"

    def __str__(self):
        return self.nom


class Categoria(Base):
    """Modelo de Categoría de productos"""
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nom = Column(String(50), nullable=False, unique=True)

    # Relación inversa
    productes = relationship('Producte', secondary=producte_categoria, back_populates='categories')

    def __repr__(self):
        return f"<Categoria(id={self.id}, nom='{self.nom}')>"

    def __str__(self):
        return self.nom


class Producte(Base):
    """Modelo de Producto"""
    __tablename__ = 'productes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    codi = Column(Integer, unique=True, nullable=False)
    nom = Column(String(150), nullable=False)
    preu = Column(Float, nullable=False)
    unitat = Column(String(10), nullable=True)  # 'kg' o 'unitat'
    descripcio = Column(Text, nullable=True)
    date_created = Column(Date, default=date.today)

    # Relaciones Many-to-Many
    families = relationship('Familia', secondary=producte_familia, back_populates='productes')
    categories = relationship('Categoria', secondary=producte_categoria, back_populates='productes')

    def __repr__(self):
        return f"<Producte(codi={self.codi}, nom='{self.nom}', preu={self.preu})>"

    def __str__(self):
        return self.nom

    @property
    def preu_formatat(self):
        """Precio formateado con 2 decimales"""
        return f"{self.preu:.2f} €"

    @property
    def familia_noms(self):
        """Lista de nombres de familias"""
        return [f.nom for f in self.families]

    @property
    def categoria_noms(self):
        """Lista de nombres de categorías"""
        return [c.nom for c in self.categories]
